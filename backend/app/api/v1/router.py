from fastapi import APIRouter
from app.api.v1.endpoints import analyze, health

api_router = APIRouter()

# Rotas de saúde e configuração de IA
api_router.include_router(health.router, tags=["Saúde & Provedores"])

# Rotas de análise de contratos
api_router.include_router(analyze.router, tags=["Análise Contratual"])
