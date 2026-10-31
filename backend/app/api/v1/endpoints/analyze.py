from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.parsers.document_parser import DocumentParser
from app.schemas.contract import AnalyzeTextRequest, ContractAnalysisResponse
from app.services.agent_orchestrator import AgentOrchestrator

router = APIRouter()


@router.post(
    "/analyze",
    response_model=ContractAnalysisResponse,
    summary="Analisa contrato via Upload de Arquivo ou Texto (Form-Data)"
)
async def analyze_document(
    file: Optional[UploadFile] = File(None, description="Arquivo PDF ou TXT do contrato"),
    text: Optional[str] = Form(None, description="Texto colado do contrato"),
    provider: Optional[str] = Form(None, description="Provedor de IA (gemini, ollama, openai)"),
    model_name: Optional[str] = Form(None, description="Nome do modelo (ex: llama3.2, gemini-1.5-flash)"),
    api_key: Optional[str] = Form(None, description="Chave de API do usuário (BYO-AI)"),
    user_role: Optional[str] = Form("locatario / consumidor", description="Papel do usuário no contrato")
):
    """
    Recebe um contrato via upload de PDF/texto ou formulário e retorna a análise completa:
    - Tradução dos termos difíceis
    - Pontos fortes e garantias
    - Cláusulas abusivas, duplo sentido e pegadinhas
    - Linha do tempo com datas críticas e multas
    - Score de risco de 1 a 10
    - Perguntas sugeridas para negociação
    """
    contract_content = ""

    if file and file.filename:
        contract_content = await DocumentParser.extract_text_from_upload(file)
    elif text and text.strip():
        contract_content = text.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="É obrigatório enviar um arquivo (PDF/TXT) ou fornecer o texto do contrato no campo 'text'."
        )

    if len(contract_content) < 30:
        raise HTTPException(
            status_code=400,
            detail="O texto extraído do documento é curto demais para ser um contrato válido."
        )

    result = await AgentOrchestrator.analyze(
        contract_text=contract_content,
        user_role=user_role,
        provider=provider,
        model_name=model_name,
        api_key=api_key
    )

    return result


@router.post(
    "/analyze/text",
    response_model=ContractAnalysisResponse,
    summary="Analisa contrato a partir de payload JSON"
)
async def analyze_document_json(payload: AnalyzeTextRequest):
    """Permite enviar o texto do contrato e credenciais diretamente via JSON payload."""
    result = await AgentOrchestrator.analyze(
        contract_text=payload.text,
        user_role=payload.user_role,
        provider=payload.provider,
        model_name=payload.model_name,
        api_key=payload.api_key
    )
    return result
