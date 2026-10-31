from typing import Optional
from fastapi import HTTPException
from app.core.config import settings
from app.core.adapters.base import BaseAIAdapter
from app.core.adapters.gemini_adapter import GeminiAdapter
from app.core.adapters.ollama_adapter import OllamaAdapter
from app.core.adapters.openai_adapter import OpenAIAdapter


class AIEngineFactory:
    """Fábrica para instanciar o adaptador correto de IA baseado no pedido do usuário ou configuração padrão."""

    @staticmethod
    def get_adapter(
        provider: Optional[str] = None,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> BaseAIAdapter:
        selected_provider = (provider or settings.AI_PROVIDER).lower().strip()

        if selected_provider == "gemini":
            key = api_key or settings.GEMINI_API_KEY
            model = model_name or settings.GEMINI_DEFAULT_MODEL
            return GeminiAdapter(api_key=key, model_name=model)

        elif selected_provider == "ollama":
            model = model_name or settings.OLLAMA_DEFAULT_MODEL
            return OllamaAdapter(base_url=settings.OLLAMA_BASE_URL, model_name=model)

        elif selected_provider in ["openai", "chatgpt"]:
            key = api_key or settings.OPENAI_API_KEY
            model = model_name or settings.OPENAI_DEFAULT_MODEL
            return OpenAIAdapter(api_key=key, model_name=model)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Provedor de IA desconhecido: '{selected_provider}'. Suportados: 'gemini', 'ollama', 'openai'."
            )
