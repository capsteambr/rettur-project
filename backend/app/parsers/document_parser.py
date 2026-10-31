import io
import re
from fastapi import HTTPException, UploadFile
from pypdf import PdfReader


class DocumentParser:
    """Extrai e normaliza o texto de arquivos submetidos pelo usuário."""

    @staticmethod
    async def extract_text_from_upload(file: UploadFile) -> str:
        filename = file.filename or "documento"
        extension = filename.split(".")[-1].lower() if "." in filename else ""

        content_bytes = await file.read()
        if not content_bytes:
            raise HTTPException(status_code=400, detail="O arquivo enviado está vazio.")

        if extension == "pdf":
            return DocumentParser._extract_from_pdf(content_bytes)
        elif extension in ["txt", "md"]:
            return DocumentParser._extract_from_text(content_bytes)
        else:
            # Tenta decodificar como texto puro como fallback
            try:
                return content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Formato '.{extension}' não suportado diretamente. Por favor, envie um PDF ou arquivo de texto (.txt)."
                )

    @staticmethod
    def _extract_from_pdf(content_bytes: bytes) -> str:
        try:
            reader = PdfReader(io.BytesIO(content_bytes))
            extracted_pages = []
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    extracted_pages.append(f"--- PÁGINA {idx + 1} ---\n{page_text}")

            full_text = "\n\n".join(extracted_pages).strip()
            if not full_text:
                raise HTTPException(
                    status_code=400,
                    detail="Não foi possível extrair texto do PDF. O documento pode ser uma imagem digitalizada sem camada de OCR."
                )
            return full_text
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Erro ao ler arquivo PDF: {str(e)}"
            )

    @staticmethod
    def _extract_from_text(content_bytes: bytes) -> str:
        try:
            return content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                return content_bytes.decode("latin-1")
            except Exception:
                raise HTTPException(status_code=400, detail="Erro de codificação ao ler o arquivo de texto.")

    @staticmethod
    def clean_text(text: str) -> str:
        """Limpa espaços excessivos e quebras de linha repetidas."""
        text = re.sub(r"\r\n|\r", "\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
