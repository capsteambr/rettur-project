# 🛡️ PLANO DE CONTINGÊNCIA, CONFORMIDADE ÉTICA (OAB) & MODELO DE MONETIZAÇÃO

> **Projeto:** Rettur  
> **Autores:** Daniel Douglas Melo Gomes Neto & Lucas Pereira Brito  
> **Versão:** 2.0 (Pivot Pós-Pré-Banca: SaaS Marketplace Jurídico B2B2C)

---

## 1. Contexto e Motivação do Pivot

Após rodada de pré-banca, foram identificados riscos regulatórios e oportunidades de negócio:
1. **Risco de Invasão de Competência Privativa (Lei 8.906/94):** Sistemas de IA não podem emitir pareceres conclusivos, caracterizar condutas como crime ou prestar consultoria jurídica privativa.
2. **Necessidade do Elo Humano:** A IA deve atuar como uma **ferramenta de triagem e inteligência preliminar (leitura assistiva)**, direcionando o cliente consciente para o profissional habilitado (Advogado).
3. **Sustentabilidade Financeira:** Transformação em um **SaaS de Conexão Inteligente**, onde o cidadão tem acesso gratuito inicial e os advogados pagam uma assinatura SaaS para ter acesso a clientes qualificados e perfis verificados.

---

## 2. Matriz de Conformidade Ética e Disclaimers (OAB & Provimento 205/2021)

A plataforma opera em estrita conformidade com o **Código de Ética e Disciplina da OAB** e o **Provimento nº 205/2021**:

### 2.1 Diretrizes de Comunicação da IA (Guardrails de Linguagem)
- ❌ **TERMINANTEMENTE PROIBIDO:** Dizer *"Esta cláusula é crime"*, *"Você tem direito garantido à indenização"*, *"Não pague este boleto"* ou emitir pareceres vinculantes.
- ✅ **LINGUAGEM OBRIGATÓRIA (Preventiva e Recomendatória):** 
  - *"Recomenda-se atenção especial ao prazo previsto no parágrafo 2º."*
  - *"A jurisprudência predominante costuma considerar abusiva a retenção superior a 20%, recomendando-se alinhamento com advogado."*
  - *"Sugere-se esclarecer este ponto com o contratante ou com um profissional especializado."*

### 2.2 Termo de Não-Consultoria (Disclaimer Visível em Todas as Telas)
> *"O Rettur é um software de suporte cognitivo e triagem de documentos. Suas análises têm caráter meramente informativo e de suporte à leitura, **não constituindo parecer jurídico, consultoria ou patrocínio advocatício**. A contratação e validação de direitos cabem exclusivamente a advogados devidamente inscritos na OAB."*

### 2.3 Captação de Clientes e Publicidade Jurídica
- A plataforma não faz "leilão de preços" de honorários nem mercantilização.
- O diretório lista os advogados por **especialidade técnica, comarca/região de atuação e número de OAB verificado**, cabendo ao cliente a iniciativa voluntária de entrar em contato.

---

## 3. Modelo de Monetização & Precificação

A plataforma adota um modelo de **Marketplace SaaS Bilateral**:

```
[ CLIENTES / CIDADÃOS ]                  [ ADVOGADOS & ESCRITÓRIOS ]
         │                                            │
         ▼                                            ▼
  Modelo Freemium                             Assinatura Mensal/Anual
 (Até 10 docs/mês grátis)                   (Acesso ao Diretório & Leads)
```

### 3.1 Para o Cliente Final (Cidadão / PME)
* **Plano Gratuito (Cidadão):**
  * Até **10 análises de documentos por mês** gratuitas.
  * Pré-análise completa com pontos de atenção e cronograma.
  * Acesso ilimitado ao diretório de advogados por setor e região.
* **Plano Cliente Pro (R$ 19,90/mês ou R$ 9,90 por documento extra):**
  * Análises ilimitadas para pequenas empresas e autônomos.
  * Comparativo lado a lado de versões de contratos.
  * Exportação de relatórios executivos em PDF com logotipo.

### 3.2 Para os Advogados (Assinatura SaaS B2B)
Os advogados pagam uma mensalidade para estar no diretório verificado e receber solicitações diretas de clientes que acabaram de analisar um documento compatível com sua especialidade:

| Plano Advogado | Valor Mensal | Benefícios Inclusos |
|---|---|---|
| **Plano Básico** | **R$ 69,90 / mês** | Perfil público verificado com OAB, listagem em 1 área de atuação e 1 região/comarca. Recebe até 5 contatos diretos de clientes por mês. |
| **Plano Especialista (Mais Popular)** | **R$ 129,90 / mês** | Perfil com destaque de credenciais, até 3 áreas de atuação (ex: Imobiliário + Consumidor + Cível), cobertura estadual, recebimento de até 20 contatos qualificados com pré-análise do contrato já autorizada pelo cliente. |
| **Plano Escritório / Corporate** | **R$ 299,90 / mês** | Perfis múltiplos para associados, todas as áreas do Direito, painel analítico de demanda jurídica da região e integração via API. |

---

## 4. Plano de Contingência Técnico e Operacional

| Risco Identificado | Probabilidade | Impacto | Ação de Mitigação / Contingência |
|---|---|---|---|
| **Questionamento ético por comissão da OAB** | Baixa/Média | Alto | Apresentar parecer técnico do produto demonstrando que a IA apenas destaca trechos e direciona para advogados cadastrados, atuando como canal de valorização da advocacia. Manter o disclaimer visível. |
| **Alucinação da IA ao analisar documento** | Baixa | Médio | Pydantic schema estrito com fallbacks pré-programados, temperatura baixa (`0.2`), injeção de guardrails proibindo acusações de condutas criminosas e sugestão permanente de validação profissional. |
| **Instabilidade de API de terceiros (Gemini/OpenAI)** | Baixa | Médio | Arquitetura Multi-Engine: Se a nuvem cair, chaveamento automático para o motor alternativo ou instrução para usar o Ollama local. |
| **Vazamento de dados ou violação de sigilo (LGPD)** | Média | Alto | Processamento 100% efêmero em memória RAM. Nenhum contrato de cliente é salvo em banco permanente sem consentimento explícito. Documento descartado ao fechar a conexão. |
| **Advogados cadastrados sem OAB ativa** | Baixa | Alto | Checagem de número de inscrição via CNA (Cadastro Nacional dos Advogados) antes da aprovação do perfil profissional no diretório. |

---

## 5. Fluxo de Usuário 2.0 (End-to-End)

```
1. Cliente faz login ou acessa como visitante.
2. Cliente envia o contrato (PDF ou Texto).
3. A IA realiza a pré-análise:
   - Resumo em linguagem simples
   - Alertas preventivos (sem acusações jurídicas definitivas)
   - Calendário de prazos
   - Identificação da área jurídica necessária (ex: Direito Imobiliário).
4. A tela exibe o resultado e sugere:
   "Encontramos 4 advogados especialistas em Direito Imobiliário na sua região (Goiânia - GO)".
5. O cliente visualiza os perfis dos advogados e pode iniciar contato via WhatsApp/E-mail com 1 clique.
```
