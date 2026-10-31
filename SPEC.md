# 📋 SPEC.md - Especificação Técnica e Funcional do Produto

## 1. Visão Geral do Produto

### 1.1 Objetivo
O **Condinome Panda** é uma plataforma multiplataforma (Web e Mobile) desenhada para empoderar cidadãos leigos na leitura, análise e compreensão de contratos, acordos de trabalho, termos de adesão e documentos legais em geral. O sistema diagnostica abusividades, ambiguidades, riscos financeiros e calendários de obrigações com clareza absoluta, possibilitando o uso de inteligência artificial em nuvem ou localmente (BYO-AI).

### 1.2 Persona Alvo
- **Dona Maria / João (Trabalhador ou Autônomo):** Precisa assinar um contrato de aluguel ou prestação de serviços como PJ/MEI, não tem dinheiro para pagar honorários advocatícios e tem medo de multas abusivas ou cobranças indevidas.
- **Estudante / Jovem Adulto:** Primeiro contrato de estágio ou financiamento educacional, sem nenhuma intimidade com terminologias jurídicas.

---

## 2. Casos de Uso Prioritários

1. **UC01 - Contrato de Locação Residencial:**
   - Detectar índice de reajuste desvantajoso (ex: IGP-M vs. IPCA).
   - Identificar responsabilidade indevida por obras estruturais do imóvel.
   - Apontar regras de vistoria e exigência ilegal de dupla garantia (ex: caução + fiador).
2. **UC02 - Contrato de Prestação de Serviços / MEI:**
   - Detectar cláusulas de subordinação disfarçada (risco de falso PJ).
   - Verificar cláusulas de exclusividade e não-concorrência desmedidas sem compensação financeira.
3. **UC03 - Termo de Adesão (Academia, Cursos, Assinaturas):**
   - Alertar sobre renovação automática silenciosa.
   - Checar percentual de retenção de parcelas em caso de desistência (multa rescisória excessiva).
4. **UC04 - Empréstimos e Financiamentos:**
   - Destacar Custo Efetivo Total (CET), juros compostos embutidos e penalidades por atraso de pagamento.

---

## 3. Requisitos do Sistema

### 3.1 Requisitos Funcionais (RF)

| ID | Nome | Descrição | Prioridade MVP |
|---|---|---|---|
| **RF01** | Upload de Documentos | O sistema deve aceitar upload de arquivos `.pdf`, `.docx`, imagens (`.png`, `.jpg`, `.jpeg`) e colagem de texto puro. | Alta |
| **RF02** | Extração de Texto / OCR | O sistema deve extrair o conteúdo textual de PDFs digitais ou aplicar OCR caso se trate de imagem/foto escaneada. | Alta |
| **RF03** | BYO-AI (Bring Your Own AI) | O usuário deve poder escolher entre usar modelos locais (Ollama / LM Studio) ou inserir credencial de APIs em nuvem (Gemini, OpenAI, Anthropic). | Alta |
| **RF04** | Análise de Pontos Fortes e Fracos | O sistema deve listar explicitamente em colunas ou cartões o que é favorável e o que é prejudicial ao usuário. | Alta |
| **RF05** | Detecção de Ambiguidades e Pegadinhas | Identificar redações prolixas, cláusulas com duplo sentido, prazos ocultos e renúncias a direitos garantidos pelo CDC/CLT. | Alta |
| **RF06** | Linha do Tempo e Prazos | O sistema deve extrair uma lista cronológica de eventos relevantes (datas de vencimento, reajustes, aviso prévio para cancelamento). | Alta |
| **RF07** | Score de Risco Intuitivo | Exibir uma pontuação de 1 a 10 e indicador de risco com semáforo visual (Verde: Baixo, Amarelo: Médio, Vermelho: Alto/Crítico). | Alta |
| **RF08** | Perguntas Sugeridas para Negociação | O sistema deve gerar de 3 a 5 perguntas estratégicas para o usuário questionar a outra parte antes de assinar. | Alta |
| **RF09** | Captura Mobile por Câmera | No app Flutter, permitir tirar fotos de páginas impressas do contrato diretamente pela câmera do celular. | Média |
| **RF10** | Exportação de Relatório Descomplicado | Permitir exportar o resumo da análise em PDF amigável ou compartilhar via WhatsApp. | Baixa (Pós-MVP) |

### 3.2 Requisitos Não Funcionais (RNF)

| ID | Nome | Descrição |
|---|---|---|
| **RNF01** | Privacidade e Ephemerality | Nenhum documento de usuário deve ser persistido em banco de dados permanente; o processamento em memória deve ser descartado ao final da requisição. |
| **RNF02** | Desempenho / Streaming | A interface deve apresentar estados visuais de progresso e suportar streaming ou feedback em etapas para evitar a sensação de travamento. |
| **RNF03** | Acessibilidade e Linguagem | O vocabulário das análises deve ter índice de facilidade de leitura elevado (Flesch-Kincaid / nível de ensino fundamental/médio). |
| **RNF04** | Portabilidade de Plataforma | O frontend Web deve ser 100% responsivo para navegadores modernos e o Mobile executável em Android e iOS. |
| **RNF05** | Desacoplamento de Provedor | A arquitetura do backend deve isolar a chamada de IA atrás de uma interface abstrata (`BaseAIProvider`). |

---

## 4. Arquitetura da API Backend (FastAPI)

### 4.1 Endpoints Principais

#### `GET /api/v1/health`
Verifica a integridade da API e serviços auxiliares.
- **Resposta:** `{"status": "ok", "version": "1.0.0"}`

#### `GET /api/v1/ai/providers`
Retorna a lista de provedores de IA suportados e o status de conectividade atual.
- **Resposta:**
```json
{
  "active_provider": "gemini",
  "available_providers": [
    {"id": "ollama", "name": "Ollama (Local / Offline)", "configured": true, "default_model": "llama3.2"},
    {"id": "gemini", "name": "Google Gemini", "configured": true, "default_model": "gemini-1.5-flash"},
    {"id": "openai", "name": "OpenAI (GPT-4o / 4o-mini)", "configured": false, "default_model": "gpt-4o-mini"},
    {"id": "anthropic", "name": "Anthropic Claude", "configured": false, "default_model": "claude-3-5-sonnet"}
  ]
}
```

#### `POST /api/v1/analyze`
Recebe o documento (arquivo `multipart/form-data` ou payload JSON com texto bruto) e configurações de inferência de IA.
- **Entrada (Form-Data):**
  - `file`: Arquivo opcional (PDF, imagem, DOCX).
  - `text`: Texto colado opcional (se nenhum arquivo for enviado).
  - `provider`: `"ollama" | "gemini" | "openai" | "anthropic"` (opcional, padrão do `.env`).
  - `api_key`: Chave temporária fornecida pelo usuário na sessão (opcional).
  - `model_name`: Modelo específico (ex: `llama3.2`, `gemini-1.5-flash`).
  - `user_role`: `"locatario" | "prestador" | "consumidor" | "outro"` (para calibrar a análise pró-usuário).

- **Resposta de Sucesso (HTTP 200):** Objeto com schema completo definido no `AGENTS.md`.

---

## 5. Design das Aplicações Cliente

### 5.1 Web Frontend (React)
- **Tela 1: Home / Dropzone:**
  - Banner explicativo de acolhimento ("Envie seu contrato e entenda cada linha antes de assinar").
  - Dropzone com arrastar e soltar (drag and drop) de PDF ou foto.
  - Alternador de configuração de IA (ícone de engrenagem para escolher Provedor Local vs Nuvem).
  - Seleção de papel do usuário ("Eu sou quem está alugando / prestando serviço / comprando").
- **Tela 2: Dashboard de Resultado:**
  - **Topo:** Score de Risco (1 a 10) com cor de semáforo e Resumo Executivo em 3 frases.
  - **Coluna Dupla:** 
    - Lado Esquerdo: 🟢 O que joga a seu favor (Pontos Fortes).
    - Lado Direito: 🔴 Pegadinhas, Cláusulas com Duplo Sentido & Armadilhas.
  - **Linha do Tempo Interativa:** Datas de reajuste, multas de saída e prazos de carência.
  - **Cartão de Ação Imediata:** 3 perguntas prontas para copiar e mandar no WhatsApp da imobiliária ou contratante.

### 5.2 Mobile App (Flutter)
- **Bottom Navigation Simples:**
  - **Aba 1 (Escanear):** Botão grande de Câmera com guia de enquadramento para tirar foto de documento ou escolher da galeria.
  - **Aba 2 (Análise Recente):** Visualização em cards expansíveis idêntica ao dashboard web.
  - **Aba 3 (Configurações):** Configuração de endpoint local (ex: IP do Ollama na rede local `http://192.168.x.x:11434`) ou chave de API.

---

## 6. Planejamento de Execução para o Hackathon

```
[Sprint 1: Backend & IA Core]
  ├── Setup FastAPI + Pydantic Schemas
  ├── Extrator de Texto (PDF/OCR)
  ├── Adaptadores de IA (Ollama + Gemini/OpenAI)
  └── Prompts estruturados para os Agentes

[Sprint 2: Web App React]
  ├── Setup Vite + Tailwind + TypeScript
  ├── Componente de Upload e Seletor de Modelo
  └── Dashboard de Leitura Simplificada (Cards, Timeline, Score)

[Sprint 3: Mobile Flutter & Polimento Final]
  ├── Estrutura Flutter com Image Picker
  ├── Integração com endpoint `/analyze`
  ├── Ajustes de tom de voz e testes com contratos reais (aluguel, prestação de serviço)
  └── Pitch & Demonstração (Vídeo/Apresentação)
```
