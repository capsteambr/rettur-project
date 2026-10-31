# 🤖 AGENTS.md - Arquitetura de Agentes & Diretrizes de Desenvolvimento

Este documento define:
1. **A Arquitetura de Agentes de IA do Domínio:** Os agentes cognitivos especializados responsáveis por ler, auditar e simplificar os contratos para os usuários.
2. **Diretrizes para Agentes de Codificação (AI Coding Assistants):** Regras de conduta, padrões arquiteturais e boas práticas para agentes de IA que desenvolvam código neste repositório.

---

# PARTE 1: Pipeline Cognitivo de Análise Contratual

Para garantir alta precisão e evitar alucinações ao lidar com documentos legais complexos, a análise é particionada em agentes de responsabilidade única executados em um fluxo de pipeline com saídas estritamente tipadas (JSON Schema / Pydantic).

```
   [ Documento Bruto (PDF/Foto/Texto) ]
                     │
                     ▼
       ┌─────────────────────────────┐
       │ 1. Ingestion & Sanitizer    │ ◄── Extração OCR, Limpeza e Segmentação
       └─────────────┬───────────────┘
                     │
                     ├──────────────────────────────┬──────────────────────────────┐
                     ▼                              ▼                              ▼
       ┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐
       │  2. Ambiguity & Trap Agent  ││ 3. Plain Language Agent     ││ 4. Timeline & Rights Agent  │
       │  (Cláusulas Abusivas / Risco)││ (Tradução e Simplificação) ││ (Prazos, Multas, Vigências) │
       └─────────────┬───────────────┘└─────────────┬───────────────┘└─────────────┬───────────────┘
                     │                              │                              │
                     └──────────────────────────────┼──────────────────────────────┘
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │ 5. Synthesizer & Auditor    │ ◄── Score de Risco, Alertas Críticos,
                                     │                             │     Perguntas para Fazer Antes de Assinar
                                     └──────────────┬──────────────┘
                                                    ▼
                                        [ Relatório Final ao Usuário ]
```

---

## 1. Descrição dos Agentes Cognitivos

### Agente 1: Ingestion & Sanitizer Agent (`ingestion_agent`)
- **Objetivo:** Ingerir o arquivo (PDF, imagem ou texto), converter em texto corrido e segmentar em blocos/cláusulas numeradas.
- **Função de Privacidade (LGPD):** Opcionalmente mascara dados altamente sensíveis (número de CPF, RG, contas bancárias) antes do envio para modelos remotos de IA, mantendo nomes de partes e obrigações para contextualização.

### Agente 2: Ambiguity & Trap Hunter Agent (`risk_agent`)
- **Objetivo:** Caçar ativamente "pegadinhas", cláusulas com duplo sentido, armadilhas financeiras e desequilíbrio na relação contratual.
- **Focos de Análise:**
  - Multas rescisórias desproporcionais ou acumuladas.
  - Renúncia velada a garantias legais (ex: Código de Defesa do Consumidor ou CLT).
  - Renovações automáticas sem aviso prévio obrigatório.
  - Foro de eleição em comarcas distantes que inviabilizem a defesa do contratante hipossuficiente.
  - Cláusulas de duplo sentido ou redação prolixa intencional.

### Agente 3: Plain Language Translator Agent (`simplifier_agent`)
- **Objetivo:** Traduzir termos herméticos do direito ("juridiquês") para analogias concretas do dia a dia de um cidadão comum.
- **Exemplo de Tradução:**
  - *Juridiquês:* *"A resilição unilateral operará de pleno direito mediante notificação premonitória de 30 dias, sob cominação de perdas e danos."*
  - *Linguagem Simples:* *"Se você quiser cancelar o contrato antes da hora, tem que avisar com 30 dias de antecedência por escrito; senão, terá que pagar uma indenização pelo tempo restante."*

### Agente 4: Timeline & Obligations Tracker Agent (`timeline_agent`)
- **Objetivo:** Mapear o calendário prático do contrato.
- **Campos Extraídos:**
  - Data de início e término da vigência.
  - Periodicidade e índice de reajuste (ex: IPCA, IGP-M).
  - Prazo limite para aviso de não-renovação.
  - Datas de vencimento de parcelas e carências.

### Agente 5: Synthesizer & Auditor Agent (`synthesizer_agent`)
- **Objetivo:** Consolidar os outputs em um relatório unificado com score visual e guia de ação.
- **Outputs Gerados:**
  - **Score Geral de Risco:** 1 a 10 (onde 1 é seguro/equilibrado e 10 é extremamente perigoso/abusivo).
  - **Prós (Pontos Fortes):** Proteções que o contrato confere ao usuário.
  - **Contras (Pontos Fracos):** Desvantagens e riscos aceitos.
  - **Perguntas de Ouro:** 3 a 5 perguntas objetivas que o usuário deve fazer para a outra parte antes de assinar.

---

## 2. Contrato de Dados da Análise (JSON Schema de Saída)

Todos os modelos de IA (seja OpenAI, Gemini ou Ollama local) devem formatar suas respostas estruturadas de acordo com o seguinte modelo Pydantic:

```json
{
  "contract_type": "Aluguel Residencial | Trabalho | Prestação de Serviços | Empréstimo | Outro",
  "risk_score": 7,
  "risk_level": "BAIXO" | "MEDIO" | "ALTO" | "CRITICO",
  "summary_plain_text": "Resumo de 3 a 4 parágrafos em linguagem humana direta...",
  "strengths": [
    {
      "clause_reference": "Cláusula 4ª, Parágrafo 1º",
      "title": "Garantia de Manutenção pelo Locador",
      "explanation": "O proprietário é obrigado a consertar problemas estruturais graves sem cobrar nada de você."
    }
  ],
  "weaknesses_and_traps": [
    {
      "clause_reference": "Cláusula 12ª",
      "title": "Renovação Automática Escondida",
      "severity": "ALTO",
      "ambiguity_detected": true,
      "original_snippet": "O silêncio das partes implicará na prorrogação compulsória...",
      "plain_explanation": "Se você esquecer de avisar 60 dias antes, o contrato renova sozinho por mais 2 anos com multa caso queira sair.",
      "recommendation": "Exija a retirada dessa cláusula ou anote na sua agenda para enviar notificação com antecedência."
    }
  ],
  "timeline": [
    {
      "event": "Reajuste Anual",
      "trigger_date_or_period": "A cada 12 meses",
      "metric_or_consequence": "Reajuste pelo IGP-M",
      "alert": "O IGP-M pode sofrer altas fortes; prefira negociar IPCA se possível."
    }
  ],
  "actionable_questions": [
    "O valor do condomínio inclui as taxas extraordinárias de obras?",
    "Posso enviar o aviso de cancelamento por e-mail ou WhatsApp, ou precisa ser por cartório?"
  ]
}
```

---

# PARTE 2: Diretrizes para Agentes de Codificação

Se você é um agente de software (como Antigravity, GitHub Copilot Workspace ou Devin) operando neste repositório, siga estritamente as regras abaixo:

## 1. Filosofia de Código
- **Simplicidade e Modularidade:** Código limpo e focado no MVP de hackathon, sem complexidade desnecessária.
- **Resiliência a Provedores de IA:** O backend deve tratar respostas de IA com timeouts adequados, fallbacks elegantes e parsing seguro de JSON com validação via Pydantic.
- **Portabilidade de Modelos:** Nenhuma chamada direta de API acoplada a um único vendor. Use o padrão Factory/Adapter (`AIEngineAdapter` base class).

## 2. Convenções por Camada

### Backend (Python / FastAPI)
- Versão de Python: `>= 3.10`.
- Utilize **Type Hints** e validação com **Pydantic v2**.
- Operações de I/O de rede ou disco devem ser `async/await`.
- Nunca commite segredos ou chaves no código (`.env.example` deve conter apenas variáveis fictícias).

### Frontend Web (React + Vite + TypeScript)
- Componentes funcionais com Hooks.
- TailwindCSS para estilização ágil e responsiva.
- Tratar estados de: `Idle`, `Uploading`, `Processing/Thinking`, `Success` e `Error`.
- Fornecer feedback visual rico de carregamento (skeletons e spinners durante a inferência da IA).

### Mobile (Flutter)
- Organização em `features/` ou pastas coesas (`screens/`, `widgets/`, `controllers/`).
- Gerenciamento de estado direto e previsível (ex: `ChangeNotifier` / `Provider` ou `flutter_bloc`).
- Suporte a seleção de câmera e galeria para captura de fotos de documentos.

## 3. Segurança e Privacidade
- **LGPD/GDPR:** Todo documento submetido pelo usuário é processado de forma temporária em memória (ephemeral processing) e descartado após o término da sessão.
- Quando o usuário optar por IA Local (Ollama), nenhum byte do documento deve sair da máquina local do usuário ou do host onde o backend está rodando.
