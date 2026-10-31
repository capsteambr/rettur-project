# ⚖️ Rettur - Triagem de Contratos & Conexão Jurídica

> **Plataforma de inteligência contratual preventiva e conexão entre clientes e advogados credenciados.**  
> Tradução de termos complexos para linguagem simples, identificação de pontos de atenção, prazos críticos e direcionamento ético para profissionais habilitados da OAB.

---

## 👥 Equipe & Autores
- **Daniel Douglas Melo Gomes Neto**
- **Lucas Pereira Brito**

---

## 💡 Proposta de Valor & Conformidade Ética (OAB)

Após alinhamento de pré-banca e análise regulatória (**Lei 8.906/94** e **Provimento 205/2021 da OAB**), o **Rettur** foi estruturado como uma **plataforma de suporte de leitura e triagem preventiva**:
1. **Sem Tipificação de Crimes ou Pareceres Conclusivos:** O sistema **nunca** afirma que algo é "crime" ou emite parecer privativo de advogado. Todas as observações são emitidas em tom cauteloso e recomendatório.
2. **Empoderamento do Cidadão:** O usuário submete o documento (PDF ou texto) e recebe um resumo acessível, aspectos favoráveis e pontos que merecem esclarecimento prévio.
3. **Conexão com a Advocacia:** O sistema identifica a especialidade jurídica demandada (ex: *Direito Imobiliário*, *Direito do Trabalho*, *Direito do Consumidor*) e apresenta advogados cadastrados na região para que o usuário possa buscar consultoria profissional com 1 clique.
4. **Experiência Sem Atrito (Zero Configuração de IA para o Usuário):** A inteligência artificial opera com modelo e credenciais gerenciadas centralmente no servidor via `.env` (sem exigir chaves ou escolhas complexas do usuário final).

---

## 💰 Modelo de Negócios (Marketplace SaaS Bilateral)

```
[ CLIENTES / CIDADÃOS ]                  [ ADVOGADOS & ESCRITÓRIOS ]
         │                                            │
         ▼                                            ▼
  Modelo Freemium                             Assinatura SaaS B2B
 (Até 10 análises/mês grátis)              (Perfil OAB & Leads Qualificados)
```

1. **Para Clientes / Cidadãos:**
   - **Plano Gratuito:** Até **10 análises de documentos por mês** sem custo.
   - Acesso irrestrito ao diretório de advogados com OAB verificada e contato direto por WhatsApp/E-mail.
2. **Para Advogados (Assinatura SaaS):**
   - **Plano Básico (R$ 69,90/mês):** Perfil público verificado com OAB, listagem em 1 área e 1 região.
   - **Plano Especialista (R$ 129,90/mês):** Até 3 áreas de atuação, cobertura estadual, destaque no diretório e recebimento de contatos com pré-análise do contrato já autorizada pelo cliente.
   - **Plano Escritório (R$ 299,90/mês):** Múltiplos associados e relatórios de demanda jurídica.

*(Veja o detalhamento completo em [docs/PLANO_CONTINGENCIA_MONETIZACAO.md](file:///Users/danieldouglas/bits/fatesg/hackcaton/condinome_panda/docs/PLANO_CONTINGENCIA_MONETIZACAO.md)).*

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Web Frontend** | React (Vite, TypeScript, TailwindCSS) | Interface moderna, responsiva, com suporte a tema Claro/Escuro, drag-and-drop e diretório de advogados |
| **Mobile App** | Flutter (Dart) | App multiplataforma (Android & iOS) para escaneamento e consulta rápida |
| **Backend API** | Python (FastAPI, Pydantic v2) | Endpoints assíncronos de alta performance, parser de documentos e diretório de advogados |
| **Processamento de Docs** | PyPDF / Leitura em Memória | Extração em memória RAM descartada após a requisição (Privacidade LGPD) |
| **Motor de IA** | Google Gemini / Provedor Central | Execução com prompts preventivos e saídas estruturadas em JSON estrito |

---

## 📦 Estrutura do Monorepo

```text
condinome_panda/
├── apps/
│   ├── frontend_web/         # Web App em React (Vite + TypeScript + Tailwind)
│   │   ├── src/
│   │   │   ├── components/   # Header, Dashboard, AuthModal, RiskBadge
│   │   │   ├── pages/        # HomePage (Triagem), LawyersDirectoryPage (Diretório)
│   │   │   ├── services/     # Clientes HTTP (Análise e Advogados)
│   │   │   └── types/        # Modelos TypeScript tipados
│   └── frontend_mobile/      # Aplicativo Mobile em Flutter
├── backend/                  # API REST em Python (FastAPI + Pydantic v2)
│   ├── app/
│   │   ├── api/v1/endpoints/ # /analyze, /lawyers, /health
│   │   ├── core/adapters/    # Adaptadores de IA gerenciados no servidor
│   │   ├── parsers/          # Leitor de documentos em memória (LGPD)
│   │   ├── schemas/          # Schemas Pydantic validados
│   │   └── services/         # Orquestrador cognitivo com guardrails éticos
│   ├── tests/                # Testes automatizados (pytest)
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   └── PLANO_CONTINGENCIA_MONETIZACAO.md # Estratégia de monetização e OAB
├── AGENTS.md                 # Arquitetura de agentes e diretrizes de prompt
├── SPEC.md                   # Especificação técnica e funcional completa
└── README.md
```

---

## ⚡ Como Rodar o Projeto

### 1. Backend (Python / FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
> Documentação Swagger: `http://localhost:8000/docs`

### 2. Frontend Web (React / Vite)
```bash
cd apps/frontend_web
npm install
npm run dev
```
> Aplicação Web: `http://localhost:5173`

---

## ⚖️ Aviso Legal (Disclaimer Ético)
> O **Rettur** é uma ferramenta de triagem cognitiva e suporte de leitura prévia. **Não presta consultoria jurídica, assessoria privativa ou patrocínio processual.** Sempre consulte um advogado devidamente inscrito na OAB ou a Defensoria Pública do seu Estado para validação de direitos e tomada de decisões legais.
