import httpx
from fastapi import HTTPException
from app.core.adapters.base import BaseAIAdapter
from app.schemas.contract import ContractAnalysisResponse


class OpenAIAdapter(BaseAIAdapter):
    """Adaptador para OpenAI e APIs compatíveis (Groq, LM Studio, vLLM)."""

    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini", base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.model_name = model_name or "gpt-4o-mini"
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")
        self.chat_endpoint = f"{self.base_url}/chat/completions"

    async def analyze_contract(
        self,
        contract_text: str,
        user_role: str,
        system_prompt: str
    ) -> ContractAnalysisResponse:
        if not self.api_key:
            raise HTTPException(
                status_code=400,
                detail="Chave de API da OpenAI não fornecida. Configure no .env ou informe o parâmetro 'api_key'."
            )

        user_content = (
            f"PAPEL DO USUÁRIO NO CONTRATO: {user_role}\n\n"
            f"TEXTO DO CONTRATO PARA AUDITORIA:\n\"\"\"\n{contract_text}\n\"\"\"\n\n"
            "Gere o relatório completo em formato JSON estrito."
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                response = await client.post(self.chat_endpoint, json=payload, headers=headers)
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=502,
                    detail=f"Erro de conexão com o provedor OpenAI: {str(exc)}"
                )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro na API OpenAI ({response.status_code}): {response.text}"
            )

        data = response.json()
        try:
            raw_content = data["choices"][0]["message"]["content"]
            parsed_json = self.extract_json(raw_content)
            return ContractAnalysisResponse.model_validate(parsed_json)
        except Exception as err:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao processar resposta da OpenAI: {str(err)}"
            )
