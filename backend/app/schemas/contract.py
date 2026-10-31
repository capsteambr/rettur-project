from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    BAIXO = "BAIXO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"
    CRITICO = "CRITICO"


class ContractStrength(BaseModel):
    clause_reference: str = Field(
        ...,
        description="Identificação da cláusula (ex: 'Cláusula 4ª, Parágrafo 1º')"
    )
    title: str = Field(
        ...,
        description="Título resumido do benefício"
    )
    explanation: str = Field(
        ...,
        description="Explicação clara do porquê essa regra protege o usuário"
    )


class ContractTrap(BaseModel):
    clause_reference: str = Field(
        ...,
        description="Identificação da cláusula de risco ou abusiva"
    )
    title: str = Field(
        ...,
        description="Nome da armadilha ou vulnerabilidade identificada"
    )
    severity: RiskLevel = Field(
        ...,
        description="Nível de perigo da cláusula para o usuário"
    )
    ambiguity_detected: bool = Field(
        ...,
        description="Verdadeiro se houver duplo sentido, contradição ou redação vaga"
    )
    original_snippet: str = Field(
        ...,
        description="Trecho literal original do contrato"
    )
    plain_explanation: str = Field(
        ...,
        description="Explicação em linguagem do dia a dia sobre como essa cláusula pode prejudicar a pessoa"
    )
    recommendation: str = Field(
        ...,
        description="Orientação prática (ex: 'Peça para alterar o prazo para 30 dias')"
    )


class TimelineItem(BaseModel):
    event: str = Field(
        ...,
        description="Nome do evento (ex: 'Reajuste Anual', 'Prazo de Vistoria', 'Término do Contrato')"
    )
    trigger_date_or_period: str = Field(
        ...,
        description="Quando ocorre ou qual o prazo limite (ex: 'A cada 12 meses', 'Até 48h após entrega das chaves')"
    )
    metric_or_consequence: str = Field(
        ...,
        description="Índice financeiro, valor ou penalidade associada"
    )
    alert: Optional[str] = Field(
        None,
        description="Alerta especial de atenção para não perder o prazo"
    )


class ContractAnalysisResponse(BaseModel):
    contract_type: str = Field(
        ...,
        description="Tipo identificado do documento (ex: 'Aluguel Residencial', 'Prestação de Serviços MEI', 'Empréstimo')"
    )
    risk_score: int = Field(
        ...,
        ge=1,
        le=10,
        description="Score geral de risco de 1 a 10 (onde 1 é muito seguro e 10 é extremamente perigoso)"
    )
    risk_level: RiskLevel = Field(
        ...,
        description="Classificação textual do risco"
    )
    summary_plain_text: str = Field(
        ...,
        description="Resumo do contrato em 2 a 4 parágrafos em linguagem humana direta"
    )
    strengths: List[ContractStrength] = Field(
        default_factory=list,
        description="Pontos fortes e garantias que protegem o usuário"
    )
    weaknesses_and_traps: List[ContractTrap] = Field(
        default_factory=list,
        description="Pontos fracos, pegadinhas, duplo sentido e cláusulas abusivas"
    )
    timeline: List[TimelineItem] = Field(
        default_factory=list,
        description="Linha do tempo prática de datas, prazos e vencimentos"
    )
    actionable_questions: List[str] = Field(
        default_factory=list,
        description="3 a 5 perguntas objetivas que o usuário deve fazer antes de assinar"
    )


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Texto corrido do contrato")
    provider: Optional[str] = Field(None, description="Provedor de IA: gemini, ollama, openai")
    model_name: Optional[str] = Field(None, description="Modelo específico (ex: llama3.2, gemini-1.5-flash)")
    api_key: Optional[str] = Field(None, description="Chave de API temporária (BYO-AI)")
    user_role: Optional[str] = Field(
        "locatario / contratante / consumidor",
        description="Papel do usuário no contrato (ex: 'locatario', 'prestador', 'empregado')"
    )


class ProviderInfo(BaseModel):
    id: str
    name: str
    configured: bool
    default_model: str
    description: str


class ProvidersResponse(BaseModel):
    active_provider: str
    available_providers: List[ProviderInfo]
