from typing import Optional, List
from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_recommended: bool = False


class TestConnectionRequest(BaseModel):
    provider: str = Field(..., description="gemini, ollama, openai")
    api_key: Optional[str] = Field(None, description="Chave de API do usuário")
    base_url: Optional[str] = Field(None, description="URL base (necessário para Ollama)")


class TestConnectionResponse(BaseModel):
    success: bool
    provider: str
    message: str
    models: List[ModelInfo] = Field(default_factory=list)
