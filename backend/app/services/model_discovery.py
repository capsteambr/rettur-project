import httpx
from typing import Optional, List
from app.core.config import settings
from app.schemas.ai_test import ModelInfo, TestConnectionResponse


class ModelDiscoveryService:
    """Testa conexões de IA e lista modelos compatíveis com auditoria de texto."""

    @staticmethod
    async def test_and_list(
        provider: str,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None
    ) -> TestConnectionResponse:
        provider = provider.lower().strip()

        if provider == "gemini":
            return await ModelDiscoveryService._discover_gemini(api_key)
        elif provider == "ollama":
            return await ModelDiscoveryService._discover_ollama(base_url)
        elif provider in ["openai", "chatgpt"]:
            return await ModelDiscoveryService._discover_openai(api_key, base_url)
        else:
            return TestConnectionResponse(
                success=False,
                provider=provider,
                message=f"Provedor '{provider}' não suportado para autodescoberta."
            )

    @staticmethod
    async def _discover_gemini(api_key: Optional[str]) -> TestConnectionResponse:
        key = (api_key or settings.GEMINI_API_KEY).strip()
        if not key:
            return TestConnectionResponse(
                success=False,
                provider="gemini",
                message="Chave do Google Gemini não fornecida. Insira sua chave para listar os modelos."
            )

        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url)
            except httpx.RequestError as exc:
                return TestConnectionResponse(
                    success=False,
                    provider="gemini",
                    message=f"Erro de rede ao conectar com Google Gemini: {str(exc)}"
                )

        if response.status_code != 200:
            return TestConnectionResponse(
                success=False,
                provider="gemini",
                message=f"Chave inválida ou erro na API ({response.status_code}): {response.text[:200]}"
            )

        data = response.json()
        raw_models = data.get("models", [])
        discovered: List[ModelInfo] = []

        for m in raw_models:
            name = m.get("name", "").replace("models/", "")
            methods = m.get("supportedGenerationMethods", [])
            display_name = m.get("displayName", name)

            # Filtra apenas modelos que suportam geração de texto
            if "generateContent" in methods and "gemini" in name:
                is_recommended = "flash-lite-latest" in name or "flash-latest" in name
                discovered.append(
                    ModelInfo(
                        id=name,
                        name=f"{display_name} ({name})",
                        description=m.get("description", "")[:120],
                        is_recommended=is_recommended
                    )
                )

        # Ordena recomendados primeiro
        discovered.sort(key=lambda x: (not x.is_recommended, x.id))

        return TestConnectionResponse(
            success=True,
            provider="gemini",
            message=f"Conexão com Gemini validada com sucesso! {len(discovered)} modelos disponíveis.",
            models=discovered
        )

    @staticmethod
    async def _discover_ollama(base_url: Optional[str]) -> TestConnectionResponse:
        url = (base_url or settings.OLLAMA_BASE_URL or "http://localhost:11434").rstrip("/")
        tags_url = f"{url}/api/tags"

        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                response = await client.get(tags_url)
            except httpx.ConnectError:
                return TestConnectionResponse(
                    success=False,
                    provider="ollama",
                    message=f"Ollama não está respondendo em '{url}'. Inicie o Ollama ('ollama serve') e tente novamente."
                )
            except httpx.RequestError as exc:
                return TestConnectionResponse(
                    success=False,
                    provider="ollama",
                    message=f"Erro ao conectar ao Ollama: {str(exc)}"
                )

        if response.status_code != 200:
            return TestConnectionResponse(
                success=False,
                provider="ollama",
                message=f"Erro retornado pelo Ollama ({response.status_code}): {response.text[:200]}"
            )

        data = response.json()
        models_list = data.get("models", [])
        discovered: List[ModelInfo] = []

        for m in models_list:
            model_name = m.get("name", "")
            is_recommended = "llama3" in model_name or "qwen" in model_name
            discovered.append(
                ModelInfo(
                    id=model_name,
                    name=f"{model_name}",
                    description=f"Tamanho: {(m.get('size', 0) / 1024 / 1024 / 1024):.2f} GB",
                    is_recommended=is_recommended
                )
            )

        if not discovered:
            return TestConnectionResponse(
                success=True,
                provider="ollama",
                message="Ollama conectado, mas nenhum modelo foi baixado ainda. Execute 'ollama run llama3.2' no terminal.",
                models=[]
            )

        return TestConnectionResponse(
            success=True,
            provider="ollama",
            message=f"Ollama local conectado! {len(discovered)} modelos instalados encontrados.",
            models=discovered
        )

    @staticmethod
    async def _discover_openai(api_key: Optional[str], base_url: Optional[str]) -> TestConnectionResponse:
        key = (api_key or settings.OPENAI_API_KEY).strip()
        url = (base_url or "https://api.openai.com/v1").rstrip("/") + "/models"

        if not key:
            return TestConnectionResponse(
                success=False,
                provider="openai",
                message="Chave da OpenAI não fornecida."
            )

        headers = {"Authorization": f"Bearer {key}"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=headers)
            except httpx.RequestError as exc:
                return TestConnectionResponse(
                    success=False,
                    provider="openai",
                    message=f"Erro de conexão com OpenAI: {str(exc)}"
                )

        if response.status_code != 200:
            return TestConnectionResponse(
                success=False,
                provider="openai",
                message=f"Erro na OpenAI ({response.status_code}): {response.text[:200]}"
            )

        data = response.json()
        raw = data.get("data", [])
        discovered: List[ModelInfo] = []

        for m in raw:
            mid = m.get("id", "")
            if "gpt-4" in mid or "gpt-3.5" in mid:
                discovered.append(
                    ModelInfo(
                        id=mid,
                        name=mid,
                        is_recommended="gpt-4o" in mid
                    )
                )

        discovered.sort(key=lambda x: (not x.is_recommended, x.id))

        return TestConnectionResponse(
            success=True,
            provider="openai",
            message=f"OpenAI conectada com sucesso! {len(discovered)} modelos compatíveis.",
            models=discovered
        )
