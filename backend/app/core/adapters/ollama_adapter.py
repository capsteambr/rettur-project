import httpx
from fastapi import HTTPException
from app.core.adapters.base import BaseAIAdapter
from app.schemas.contract import ContractAnalysisResponse


class OllamaAdapter(BaseAIAdapter):
    """Adaptador para Ollama local (100% offline, privado e gratuito)."""

    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "llama3.2"):
        self.base_url = (base_url or "http://localhost:11434").rstrip("/")
        self.model_name = model_name or "llama3.2"
        self.chat_endpoint = f"{self.base_url}/api/chat"

    async def analyze_contract(
        self,
        contract_text: str,
        user_role: str,
        system_prompt: str
    ) -> ContractAnalysisResponse:
        user_content = (
            f"PAPEL DO USUÁRIO NO CONTRATO: {user_role}\n\n"
            f"TEXTO DO CONTRATO PARA AUDITORIA:\n\"\"\"\n{contract_text}\n\"\"\"\n\n"
            "Analise e retorne EXCLUSIVAMENTE o objeto JSON com os campos solicitados."
        )

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=180.0) as client:
            try:
                response = await client.post(self.chat_endpoint, json=payload)
            except httpx.ConnectError:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        f"Não foi possível conectar ao Ollama local em '{self.base_url}'. "
                        "Verifique se o Ollama está rodando ('ollama serve' ou 'ollama run llama3.2') "
                        "ou configure outro provedor (como Gemini)."
                    )
                )
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=502,
                    detail=f"Erro de comunicação com o Ollama: {str(exc)}"
                )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro retornado pelo Ollama ({response.status_code}): {response.text}"
            )

        data = response.json()
        try:
            raw_content = data.get("message", {}).get("content", "")
            parsed_json = self.extract_json(raw_content)
            return ContractAnalysisResponse.model_validate(parsed_json)
        except Exception as err:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao validar resposta do modelo local ({self.model_name}): {str(err)}"
            )
