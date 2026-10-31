# 🐼 Condinome Panda - Leitor & Simplificador de Contratos

> **Democratizando o entendimento jurídico para quem mais precisa.**  
> Uma ferramenta open-source que traduz termos jurídicos complexos, detecta pegadinhas, ambiguidades e riscos contratuais em linguagem 100% leiga — com suporte a **Bring Your Own AI (BYO-AI)**, funcionando tanto com provedores em nuvem quanto com modelos locais offline.

---

## 💡 O Problema
No Brasil e no mundo, milhões de pessoas assinam contratos de aluguel, trabalho, adesão de serviços ou empréstimos sem compreender as letras miúdas. Contratar um advogado para analisar um contrato simples costuma ter custos proibitivos para a maior parte da população. O resultado? Multas surpresa, renúncia velada de direitos fundamentais e cláusulas leoninas impostas silenciosamente.

## 🚀 A Solução
O **Condinome Panda** atua como um assistente prévio de cidadania jurídica. A pessoa simplesmente envia uma foto, PDF ou texto do contrato e recebe:
1. **Linguagem Descomplicada:** Tradução instantânea do juridiquês para o português do dia a dia.
2. **Balanço de Força:** O que está justo (pontos fortes) vs. o que te prejudica (pontos fracos/desvantagens).
3. **Alerta de Pegadinhas & Duplo Sentido:** Identificação de cláusulas com interpretação perigosa ou contraditória.
4. **Linha do Tempo de Prazos & Multas:** Calendário automático com renovações automáticas, vencimentos e taxas de rescisão.
5. **Score de Risco:** Indicador visual (Verde, Amarelo, Vermelho) para rápida tomada de decisão.
6. **Autonomia de IA (BYO-AI):** O usuário pode usar sua própria chave de API (OpenAI, Gemini, Anthropic) ou rodar um modelo 100% local e privado via **Ollama / LM Studio**, garantindo total sigilo de dados sensíveis.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Web Frontend** | React (Vite, TypeScript, TailwindCSS) | Interface moderna, responsiva, com upload drag-and-drop e visualização interativa de cláusulas |
| **Mobile App** | Flutter (Dart) | App multiplataforma (Android & iOS) com captura direta pela câmera, OCR e consulta rápida |
| **Backend API** | Python (FastAPI, Pydantic) | Endpoints assíncronos de alta performance, parser de documentos e orquestração de IA |
| **Processamento de Docs** | PyPDF / pdfplumber / Tesseract OCR | Extração robusta de texto de PDFs digitais e digitalizados (fotos/scans) |
| **Camada de IA** | Modular / BYO-AI | Adaptadores para Ollama (Llama 3, Mistral, Qwen) e APIs externas (OpenAI, Google Gemini, Anthropic Claude) |

---

## 🏛️ Arquitetura do Sistema

```
[ Usuário ]
    │
    ├──► [ Web Browser (React) ] ──────┐
    │                                  │ (REST API / SSE)
    └──► [ Mobile App (Flutter) ] ─────┴──► [ Backend FastAPI (Python) ]
                                                    │
                                     ┌──────────────┴──────────────┐
                                     ▼                             ▼
                            [ Ingestão & OCR ]             [ Hub de Conexão IA ]
                         (pdfplumber / Tesseract)                  │
                                                   ┌───────────────┴───────────────┐
                                                   ▼                               ▼
                                          [ Modelo Local ]               [ Provedores Nuvem ]
                                        (Ollama / LM Studio)          (OpenAI / Gemini / Claude)
```

---

## 📦 Estrutura do Repositório

```text
condinome_panda/
├── backend/            # API REST em Python (FastAPI)
│   ├── app/
│   │   ├── api/        # Rotas da API (v1)
│   │   ├── core/       # Configurações, segurança e adapters de IA
│   │   ├── parsers/    # Extratores de texto (PDF, DOCX, OCR)
│   │   ├── prompts/    # Engenharia de prompts e schemas Pydantic
│   │   └── services/   # Lógica de negócio e orquestração dos agentes
│   └── tests/
├── frontend/           # Aplicação Web em React (Vite + TS)
│   ├── src/
│   │   ├── components/ # Componentes visuais (Uploader, RiskCard, Timeline)
│   │   ├── pages/      # Telas principais (Home, Analisador, Configurações IA)
│   │   └── services/   # Clientes HTTP para a API
├── mobile/             # Aplicativo Mobile em Flutter
│   ├── lib/
│   │   ├── screens/    # Telas (Câmera/Scan, Detalhes, Dashboard)
│   │   └── widgets/    # Componentes reutilizáveis
├── docs/               # Documentações complementares
├── AGENTS.md           # Guia de arquitetura de agentes inteligentes e convenções de IA
├── SPEC.md             # Especificação técnica e funcional completa
└── README.md
```

---

## ⚡ Começando Rápido (Quickstart)

### 1. Pré-requisitos
- **Python 3.10+**
- **Node.js 18+** e **npm/yarn/pnpm**
- **Flutter SDK 3.x+** (opcional, para rodar o app mobile)
- *(Opcional)* **Ollama** instalado localmente (`curl -fsSL https://ollama.com/install.sh`)

### 2. Rodando o Backend (Python)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
> Acesse a documentação interativa em: `http://localhost:8000/docs`

### 3. Rodando o Frontend Web (React)
```bash
cd frontend
npm install
npm run dev
```
> Acesse a aplicação em: `http://localhost:5173`

### 4. Rodando o App Mobile (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```

---

## ⚙️ Configuração de IA (BYO-AI)

O Condinome Panda foi projetado com privacidade e flexibilidade em mente. Você escolhe onde o contrato é analisado:

### Opção A: 100% Local (Privacidade Total)
1. Instale e execute o Ollama:
   ```bash
   ollama run llama3.2
   ```
2. Na tela de configurações do Panda (ou no `.env`), selecione o provedor `ollama` e a URL padrão `http://localhost:11434`.

### Opção B: Provedores em Nuvem (Mais Rápido / Maior Capacidade)
Insira sua chave de API nas configurações do sistema ou crie um arquivo `.env` no `backend/`:
```env
AI_PROVIDER=gemini # ou openai, anthropic, ollama
GEMINI_API_KEY=sua-chave-aqui
# OPENAI_API_KEY=sua-chave-aqui
# OLLAMA_BASE_URL=http://localhost:11434
```

---

## ⚖️ Aviso Legal (Disclaimer)
> O **Condinome Panda** é uma ferramenta de tecnologia assistiva para fins exclusivamente informativos e de conscientização cidadã. **Não substitui a consulta formal a um advogado ou defensor público.** Sempre que possível, procure assistência jurídica qualificada ou a Defensoria Pública do seu Estado.

---

## 👥 Equipe do Hackathon & Autores
- **Daniel Douglas Melo Gomes Neto**
- **Lucas Pereira Brito**

Projeto desenvolvido com foco em impacto social e acessibilidade jurídica.  
Distribuído sob a licença **MIT**.
