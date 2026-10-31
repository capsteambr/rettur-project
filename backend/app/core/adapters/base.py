from abc import ABC, abstractmethod
import json
import re
from typing import Dict, Any
from app.schemas.contract import ContractAnalysisResponse


class BaseAIAdapter(ABC):
    """Interface abstrata base para qualquer provedor de IA (BYO-AI)."""

    @abstractmethod
    async def analyze_contract(
        self,
        contract_text: str,
        user_role: str,
        system_prompt: str
    ) -> ContractAnalysisResponse:
        """Processa o texto do contrato e retorna o modelo estruturado validado."""
        pass

    @staticmethod
    def extract_json(raw_text: str) -> Dict[str, Any]:
        """Extrai bloco JSON mesmo que o modelo retorne com marcadores markdown ```json."""
        text = raw_text.strip()
        # Remove marcadores de código se presentes
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
        
        # Se ainda contiver chaves, pega da primeira { até a última }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start:end + 1]

        try:
            return json.loads(text)
        except json.JSONDecodeError as err:
            raise ValueError(f"Falha ao decodificar JSON retornado pelo modelo de IA: {err}. Texto bruto: {raw_text[:300]}...")
