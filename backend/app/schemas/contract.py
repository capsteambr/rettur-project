from enum import Enum
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    BAIXO = "BAIXO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"
    CRITICO = "CRITICO"


class AttentionPoint(BaseModel):
    clause_reference: str = Field(
        ...,
        description="Identificação da cláusula (ex: 'Cláusula 4ª, Parágrafo 1º')"
    )
    title: str = Field(
        ...,
        description="Título do ponto de atenção identificado"
    )
    severity: RiskLevel = Field(
        ...,
        description="Nível de sensibilidade do ponto para o usuário"
    )
    original_snippet: str = Field(
        ...,
        description="Trecho literal original do contrato"
    )
    plain_explanation: str = Field(
        ...,
        description="Explicação em linguagem clara sobre o impacto prático dessa regra"
    )
    recommendation: str = Field(
        ...,
        description="Recomendação preventiva ou ponto sugerido para validação com um advogado"
    )


class ContractStrength(BaseModel):
    clause_reference: str = Field(..., description="Identificação da cláusula")
    title: str = Field(..., description="Título resumido do aspecto favorável")
    explanation: str = Field(..., description="Explicação de como essa regra traz segurança ao usuário")


class TimelineItem(BaseModel):
    event: str = Field(..., description="Nome do evento (ex: 'Reajuste Anual', 'Prazo de Vistoria')")
    trigger_date_or_period: str = Field(..., description="Quando ocorre ou qual o prazo limite")
    metric_or_consequence: str = Field(..., description="Índice financeiro, valor ou consequência prevista")
    alert: Optional[str] = Field(None, description="Observação importante sobre o prazo")


class ContractAnalysisResponse(BaseModel):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Identificador único (UUID) da consulta para rastreamento temporário"
    )
    created_at: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z",
        description="Data e hora de emissão da pré-análise"
    )
    expires_at: str = Field(
        default_factory=lambda: (datetime.utcnow() + timedelta(days=3)).isoformat() + "Z",
        description="Data e hora de expiração e destruição definitiva da nuvem (LGPD - 72h)"
    )
    contract_type: str = Field(
        ...,
        description="Tipo identificado do documento (ex: 'Aluguel Residencial', 'Prestação de Serviços PJ')"
    )
    risk_score: int = Field(
        ...,
        ge=1,
        le=10,
        description="Nível de atenção recomendado de 1 a 10 (onde 1 é equilibrado e 10 requer ampla revisão)"
    )
    risk_level: RiskLevel = Field(..., description="Classificação do nível de atenção")
    summary_plain_text: str = Field(
        ...,
        description="Resumo do contrato em 2 a 4 parágrafos em linguagem humana direta"
    )
    strengths: List[ContractStrength] = Field(
        default_factory=list,
        description="Aspectos equilibrados e proteções já existentes no documento"
    )
    weaknesses_and_traps: List[AttentionPoint] = Field(
        default_factory=list,
        description="Pontos de atenção e recomendações preventivas para esclarecimento"
    )
    timeline: List[TimelineItem] = Field(
        default_factory=list,
        description="Linha do tempo prática de datas, prazos e vencimentos"
    )
    actionable_questions: List[str] = Field(
        default_factory=list,
        description="Perguntas recomendadas para fazer à outra parte ou levar ao seu advogado"
    )
    suggested_practice_areas: List[str] = Field(
        default_factory=list,
        description="Áreas jurídicas sugeridas para consulta especializada (ex: 'Direito Imobiliário', 'Direito do Trabalho')"
    )
    ethical_disclaimer: str = Field(
        default="Esta pré-análise possui caráter meramente informativo e de suporte à leitura. Não substitui consulta jurídica privativa da advocacia (Lei 8.906/94).",
        description="Aviso legal obrigatório"
    )


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Texto corrido do documento")
    provider: Optional[str] = Field(None, description="Provedor de IA: gemini, ollama, openai")
    model_name: Optional[str] = Field(None, description="Modelo específico")
    api_key: Optional[str] = Field(None, description="Chave de API temporária")
    user_role: Optional[str] = Field("locatario / contratante leigo", description="Papel do usuário")


class ProviderInfo(BaseModel):
    id: str
    name: str
    configured: bool
    default_model: str
    description: str


class ProvidersResponse(BaseModel):
    active_provider: str
    available_providers: List[ProviderInfo]


class Lawyer(BaseModel):
    id: str
    name: str
    oab: str
    state: str
    city: str
    areas: List[str]
    bio: str
    rating: float
    review_count: int
    phone: str
    email: str
    verified: bool = True
    available_online: bool = True


class LawyerRegisterRequest(BaseModel):
    name: str
    oab: str
    state: str
    city: str
    areas: List[str]
    bio: str
    phone: str
    email: str
