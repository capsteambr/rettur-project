import httpx
from fastapi import HTTPException
from app.core.adapters.base import BaseAIAdapter
from app.schemas.contract import ContractAnalysisResponse


class GeminiAdapter(BaseAIAdapter):
    """Adaptador para Google Gemini via REST API direta (suporta BYO-Key)."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name or "gemini-1.5-flash"
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"

    async def analyze_contract(
        self,
        contract_text: str,
        user_role: str,
        system_prompt: str
    ) -> ContractAnalysisResponse:
        if not self.api_key:
            raise HTTPException(
                status_code=400,
                detail="Chave de API do Google Gemini não fornecida. Configure no .env ou informe o parâmetro 'api_key'."
            )

        user_content = (
            f"PAPEL DO USUÁRIO NO CONTRATO: {user_role}\n\n"
            f"TEXTO DO CONTRATO PARA AUDITORIA:\n\"\"\"\n{contract_text}\n\"\"\"\n\n"
            "Analise este contrato e retorne rigorosamente o JSON solicitado no formato especificado."
        )

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_content}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }

        url = f"{self.endpoint}?key={self.api_key}"

        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                response = await client.post(url, json=payload)
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=502,
                    detail=f"Erro de conexão com o Google Gemini: {str(exc)}"
                )

        if response.status_code != 200:
            error_details = response.text
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro na API do Google Gemini ({response.status_code}): {error_details}"
            )

        data = response.json()
        try:
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("Nenhum candidato de resposta retornado pelo Gemini.")
            
            raw_text = candidates[0]["content"]["parts"][0]["text"]
            parsed_json = self.extract_json(raw_text)
            return ContractAnalysisResponse.model_validate(parsed_json)
        except Exception as err:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao processar e validar a resposta do Gemini: {str(err)}"
            )
