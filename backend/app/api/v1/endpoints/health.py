from fastapi import APIRouter
from app.core.config import settings
from app.schemas.contract import ProviderInfo, ProvidersResponse
from app.schemas.ai_test import TestConnectionRequest, TestConnectionResponse
from app.services.model_discovery import ModelDiscoveryService

router = APIRouter()


@router.get("/health", summary="Status do servidor")
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@router.get("/ai/providers", response_model=ProvidersResponse, summary="Provedores de IA suportados")
async def list_providers():
    providers = [
        ProviderInfo(
            id="gemini",
            name="Google Gemini",
            configured=bool(settings.GEMINI_API_KEY),
            default_model=settings.GEMINI_DEFAULT_MODEL,
            description="Modelo de IA rápido e de alta capacidade na nuvem do Google (Gemini 2.5 Flash)."
        ),
        ProviderInfo(
            id="ollama",
            name="Ollama (Local / Offline)",
            configured=True,  # Ollama roda localmente sem necessidade de chave
            default_model=settings.OLLAMA_DEFAULT_MODEL,
            description="Modelo executado 100% no seu computador, gratuito e com total privacidade de dados."
        ),
        ProviderInfo(
            id="openai",
            name="OpenAI (GPT-4o)",
            configured=bool(settings.OPENAI_API_KEY),
            default_model=settings.OPENAI_DEFAULT_MODEL,
            description="Modelos da OpenAI (suporta também endpoints compatíveis como Groq e LM Studio)."
        )
    ]

    return ProvidersResponse(
        active_provider=settings.AI_PROVIDER,
        available_providers=providers
    )


@router.post("/ai/test", response_model=TestConnectionResponse, summary="Testa chave e lista modelos compatíveis")
async def test_and_list_models(payload: TestConnectionRequest):
    return await ModelDiscoveryService.test_and_list(
        provider=payload.provider,
        api_key=payload.api_key,
        base_url=payload.base_url
    )

