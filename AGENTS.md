# 🤖 AGENTS.md - Arquitetura de Agentes & Diretrizes de Desenvolvimento

> **Autores / Integrantes do Projeto:**  
> - **Daniel Douglas Melo Gomes Neto**  
> - **Lucas Pereira Brito**  

---

# PARTE 1: Pipeline Cognitivo de Triagem e Leitura Contratual

Para garantir alta precisão, conformidade ética com o Estatuto da Advocacia (**Lei 8.906/94** e **Provimento 205/2021 da OAB**) e total mitigação de alucinações, a análise é particionada em agentes de responsabilidade única com saídas estritamente tipadas via **Pydantic v2**:

```
   [ Documento Bruto (PDF/Texto) ]
                 │
                 ▼
   ┌─────────────────────────────┐
   │ 1. Ingestion & Sanitizer    │ ◄── Extração em memória RAM e segmentação
   └─────────────┬───────────────┘
                 │
                 ├──────────────────────────────┬──────────────────────────────┐
                 ▼                              ▼                              ▼
   ┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐
   │  2. Preventive Risk Agent   ││ 3. Plain Language Agent     ││ 4. Timeline Tracker Agent   │
   │  (Pontos de Atenção/Clareza)││ (Tradução e Descomplicação) ││ (Prazos, Multas, Vigências) │
   └─────────────┬───────────────┘└─────────────┬───────────────┘└─────────────┬───────────────┘
                 │                              │                              │
                 └──────────────────────────────┼──────────────────────────────┘
                                                ▼
                                 ┌─────────────────────────────┐
                                 │ 5. Synthesizer & Practice   │ ◄── Score de Atenção, Perguntas Pré-Assinatura
                                 │    Area Matcher             │     e Indicação de Especialidades da OAB
                                 └──────────────┬──────────────┘
                                                ▼
                                 [ Relatório & Conexão OAB ]
```

---

## 1. Descrição dos Agentes Cognitivos

### Agente 1: Ingestion & Sanitizer Agent (`ingestion_agent`)
- **Objetivo:** Ingerir o arquivo (PDF ou texto corrido), higienizar caracteres de controle e quebras de linha irregulares.
- **Privacidade (LGPD):** Opera exclusivamente em memória volátil descartável, sem retenção permanente de dados pessoais ou empresariais.

### Agente 2: Preventive Risk & Attention Agent (`preventive_agent`)
- **Objetivo:** Identificar cláusulas com potenciais desequilíbrios, multas rescisórias elevadas e prazos excessivamente curtos para notificação.
- **Guardrails Éticos Estritos:**
  - ❌ Proibido tipificar condutas como "crime" ou afirmar nulidade absoluta como parecer conclusivo.
  - ✅ Utilizar tom preventivo: *"Recomenda-se atenção especial ao parágrafo 2º...", "Sugere-se alinhar com a outra parte ou consultar advogado especialista"*.

### Agente 3: Plain Language Translator Agent (`simplifier_agent`)
- **Objetivo:** Traduzir o "juridiquês" hermético para analogias práticas e linguagem humana direta, facilitando a tomada de decisão pelo cidadão.

### Agente 4: Timeline & Obligations Tracker Agent (`timeline_agent`)
- **Objetivo:** Mapear o calendário prático do contrato (vencimentos, periodicidade e índice de reajuste, prazos de renovação automática e carências).

### Agente 5: Synthesizer & Practice Area Matcher (`synthesizer_agent`)
- **Objetivo:** Consolidar a pré-análise e conectar a demanda com o profissional certo.
- **Outputs Gerados:**
  - **Nível Geral de Atenção Sugerido:** 1 a 10 (onde 1 é equilibrado e 10 requer ampla revisão).
  - **Aspectos Equilibrados:** Proteções que o documento confere ao usuário.
  - **Pontos de Atenção:** Aspectos com potencial desequilíbrio e recomendações preventivas.
  - **Áreas Jurídicas Sugeridas:** Especialidades correspondentes para encaminhamento (ex: *Direito Imobiliário*, *Direito do Trabalho*, *Direito do Consumidor*).
  - **Aviso Legal Obrigatório (Disclaimer OAB):** Alerta informando o caráter informativo do software.

---

## 2. Contrato de Dados (Pydantic v2 Schema)

```json
{
  "contract_type": "Locação Residencial | Trabalho | Prestação de Serviços PJ | Consumo | Outro",
  "risk_score": 7,
  "risk_level": "BAIXO" | "MEDIO" | "ALTO" | "CRITICO",
  "summary_plain_text": "Resumo amigável em 2 a 4 parágrafos...",
  "strengths": [
    {
      "clause_reference": "Cláusula 4ª, Parágrafo 1º",
      "title": "Garantia de Manutenção pelo Locador",
      "explanation": "O proprietário é obrigado a consertar defeitos estruturais sem repasse de custos."
    }
  ],
  "weaknesses_and_traps": [
    {
      "clause_reference": "Cláusula 12ª",
      "title": "Prazo Estendido de Renovação Automática",
      "severity": "ALTO",
      "original_snippet": "O silêncio das partes implicará na prorrogação compulsória...",
      "plain_explanation": "Se não houver aviso prévio com 90 dias de antecedência, o contrato renova com penalidade para rescisão.",
      "recommendation": "Recomenda-se solicitar redução do prazo para 30 dias ou agendar a notificação com antecedência."
    }
  ],
  "timeline": [
    {
      "event": "Reajuste Anual",
      "trigger_date_or_period": "A cada 12 meses",
      "metric_or_consequence": "Reajuste pelo IPCA",
      "alert": "Fique atento ao aniversário da vigência."
    }
  ],
  "actionable_questions": [
    "O valor do condomínio inclui as taxas extraordinárias de reformas prediais?"
  ],
  "suggested_practice_areas": [
    "Direito Imobiliário",
    "Direito Civil"
  ],
  "ethical_disclaimer": "Esta pré-análise possui caráter meramente informativo e de suporte à leitura. Não substitui consulta jurídica formal privativa da advocacia (Lei 8.906/94)."
}
```

---

# PARTE 2: Diretrizes para Agentes de Codificação

## 1. Filosofia de Código
- **Simplicidade e Foco no Usuário:** Interface sem atrito, direta e objetiva. O modelo e chaves de IA são gerenciados centralmente no servidor via variáveis de ambiente (`.env`).
- **Resiliência:** Tratamento elegante de erros, timeouts e respostas estruturadas e tipadas.
- **Ética Jurídica (OAB):** Nunca implementar mensagens que desmereçam ou pretendam substituir a advocacia. A plataforma serve como uma ponte de valorização da advocacia qualificada.
