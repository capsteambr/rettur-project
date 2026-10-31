import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.parsers.document_parser import DocumentParser
from app.schemas.contract import (
    ContractAnalysisResponse,
    ContractStrength,
    ContractTrap,
    RiskLevel,
    TimelineItem
)
from app.core.adapters.base import BaseAIAdapter

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Condinome Panda" in data["message"]


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"


def test_providers_endpoint():
    response = client.get("/api/v1/ai/providers")
    assert response.status_code == 200
    data = response.json()
    assert "available_providers" in data
    provider_ids = [p["id"] for p in data["available_providers"]]
    assert "gemini" in provider_ids
    assert "ollama" in provider_ids
    assert "openai" in provider_ids


def test_clean_text_utility():
    dirty_text = "Cláusula    1ª \r\n\r\n\r\n   O locatário pagará...   "
    cleaned = DocumentParser.clean_text(dirty_text)
    assert "  " not in cleaned
    assert "\r" not in cleaned
    assert "Cláusula 1ª" in cleaned


def test_extract_json_from_markdown():
    markdown_wrapped = """
    Aqui está a análise:
    ```json
    {
      "contract_type": "Aluguel",
      "risk_score": 5
    }
    ```
    Espero ter ajudado!
    """
    extracted = BaseAIAdapter.extract_json(markdown_wrapped)
    assert extracted["contract_type"] == "Aluguel"
    assert extracted["risk_score"] == 5


def test_pydantic_schema_validation():
    valid_data = {
        "contract_type": "Aluguel Residencial",
        "risk_score": 8,
        "risk_level": "ALTO",
        "summary_plain_text": "Este contrato estabelece o aluguel de um imóvel por 30 meses.",
        "strengths": [
            {
                "clause_reference": "Cláusula 5ª",
                "title": "Reparos Estruturais",
                "explanation": "O locador arca com vazamentos e reformas prediais."
            }
        ],
        "weaknesses_and_traps": [
            {
                "clause_reference": "Cláusula 14ª",
                "title": "Multa Excessiva",
                "severity": "ALTO",
                "ambiguity_detected": True,
                "original_snippet": "Multa de 6 meses de aluguel por rescisão prévia.",
                "plain_explanation": "Multa muito superior ao limite padrão da Lei do Inquilinato.",
                "recommendation": "Negocie para no máximo 3 meses proporcionais."
            }
        ],
        "timeline": [
            {
                "event": "Reajuste Anual",
                "trigger_date_or_period": "A cada 12 meses",
                "metric_or_consequence": "IPCA",
                "alert": "Fique atento ao aniversário do contrato."
            }
        ],
        "actionable_questions": [
            "A taxa de pintura no início do contrato é opcional ou obrigatória?"
        ]
    }

    parsed = ContractAnalysisResponse.model_validate(valid_data)
    assert parsed.risk_score == 8
    assert parsed.risk_level == RiskLevel.ALTO
    assert len(parsed.strengths) == 1
    assert len(parsed.weaknesses_and_traps) == 1
    assert parsed.weaknesses_and_traps[0].ambiguity_detected is True
