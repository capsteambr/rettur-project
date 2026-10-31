import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.parsers.document_parser import DocumentParser
from app.schemas.contract import (
    ContractAnalysisResponse,
    ContractStrength,
    AttentionPoint,
    RiskLevel,
    TimelineItem
)
from app.core.adapters.base import BaseAIAdapter

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Rettur" in data["message"]


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


def test_lawyers_marketplace_endpoints():
    # Lista advogados
    response = client.get("/api/v1/lawyers")
    assert response.status_code == 200
    lawyers = response.json()
    assert len(lawyers) > 0
    assert "oab" in lawyers[0]

    # Filtra por estado
    go_response = client.get("/api/v1/lawyers?state=GO")
    assert go_response.status_code == 200
    for l in go_response.json():
        assert l["state"] == "GO"

    # Áreas de atuação
    areas_resp = client.get("/api/v1/lawyers/areas")
    assert areas_resp.status_code == 200
    assert "Direito Imobiliário" in areas_resp.json()


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
    """
    extracted = BaseAIAdapter.extract_json(markdown_wrapped)
    assert extracted["contract_type"] == "Aluguel"
    assert extracted["risk_score"] == 5


def test_pydantic_schema_validation():
    valid_data = {
        "contract_type": "Locação Residencial",
        "risk_score": 7,
        "risk_level": "ALTO",
        "summary_plain_text": "Resumo informativo do contrato.",
        "strengths": [
            {
                "clause_reference": "Cláusula 3ª",
                "title": "Manutenção",
                "explanation": "Locador arca com obras de estrutura."
            }
        ],
        "weaknesses_and_traps": [
            {
                "clause_reference": "Cláusula 8ª",
                "title": "Aviso Prévio Extenso",
                "severity": "ALTO",
                "original_snippet": "Aviso de 90 dias sob pena de renovação.",
                "plain_explanation": "Prazo acima do padrão habitual de mercado.",
                "recommendation": "Recomenda-se negociar para 30 dias ou validar com advogado."
            }
        ],
        "timeline": [
            {
                "event": "Reajuste",
                "trigger_date_or_period": "12 meses",
                "metric_or_consequence": "IPCA",
                "alert": None
            }
        ],
        "actionable_questions": [
            "Qual o prazo para envio da notificação?"
        ],
        "suggested_practice_areas": ["Direito Imobiliário"]
    }

    parsed = ContractAnalysisResponse.model_validate(valid_data)
    assert parsed.risk_score == 7
    assert parsed.risk_level == RiskLevel.ALTO
    assert len(parsed.strengths) == 1
    assert len(parsed.weaknesses_and_traps) == 1
    assert parsed.suggested_practice_areas == ["Direito Imobiliário"]
