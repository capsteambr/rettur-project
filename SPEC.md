# 📋 SPEC.md - Especificação Técnica e Funcional do Produto

> **Autores / Integrantes do Projeto:**  
> - **Daniel Douglas Melo Gomes Neto**  
> - **Lucas Pereira Brito**  

---

## 1. Visão Geral do Produto (Versão 2.0 - Pós-Pré-Banca)

### 1.1 Objetivo
O **Rettur** é uma plataforma que conecta a necessidade de compreensão documental de cidadãos e empresas ao assessoramento de **advogados credenciados pela OAB**. O sistema realiza a pré-análise e triagem de contratos e termos de adesão em linguagem clara, destacando pontos de atenção e cronogramas de obrigações, e sugerindo automaticamente advogados especialistas na área e região correspondente.

### 1.2 Conformidade com o Estatuto da OAB (Lei 8.906/94 & Provimento 205/2021)
- O software atua estritamente como **suporte à leitura e triagem preventiva**.
- É terminantemente vedada a tipificação de crimes ou emissão de pareceres conclusivos pelo sistema de IA.
- O serviço valoriza a advocacia ao direcionar o cidadão para profissionais habilitados.

---

## 2. Perfis de Usuário & Modelo de Negócio

1. **Perfil Cliente (Cidadão / PME):**
   - Acessa a plataforma e submete contratos para triagem.
   - **Plano Gratuito:** Até 3 documentos analisados por mês.
   - Acesso irrestrito ao diretório de advogados com OAB verificada.
2. **Perfil Advogado / Escritório (SaaS B2B):**
   - Assina um plano mensal (Básico R$ 69,90, Especialista R$ 129,90, Escritório R$ 299,90).
   - Mantém perfil público com OAB verificada, áreas de especialidade e comarcas de atuação.
   - Recebe solicitações diretas de contato via WhatsApp e e-mail.

---

## 3. Requisitos do Sistema

### 3.1 Requisitos Funcionais (RF)

| ID | Nome | Descrição |
|---|---|---|
| **RF01** | Submissão de Documentos | O cliente envia arquivos PDF ou digita/cola o texto do documento diretamente na tela principal. |
| **RF02** | Extração em Memória (LGPD) | O backend extrai o conteúdo em memória RAM e descarta o arquivo após a resposta, sem retenção permanente. |
| **RF03** | Triagem Preventiva com IA | A IA executa a análise utilizando modelo configurado centralmente no `.env` do servidor (sem atrito de configuração para o cliente). |
| **RF04** | Aspectos Equilibrados e Pontos de Atenção | Mapear cláusulas equilibradas e pontos que requerem atenção ou esclarecimento prévio (com recomendações preventivas). |
| **RF05** | Cronograma de Prazos | Extrair linha do tempo prática de datas de vencimento, reajustes e prazos limites de aviso prévio. |
| **RF06** | Identificação da Especialidade | Identificar a área jurídica sugerida (ex: Direito Imobiliário, Trabalhista, Consumidor, Civil). |
| **RF07** | Recomendação de Advogados no Dashboard | Exibir advogados credenciados na área identificada logo abaixo do relatório, com botão de WhatsApp direto. |
| **RF08** | Diretório Geral de Advogados | Tela dedicada para buscar advogados por especialidade, estado (UF), comarca e busca textual. |
| **RF09** | Cadastro de Advogados no SaaS | Formulário para novos advogados se credenciarem com nome, OAB, estado, cidade, bio e contato. |
| **RF10** | Controle de Cota Freemium | Controle de até 10 análises gratuitas por mês por usuário cadastrado. |

### 3.2 Requisitos Não Funcionais (RNF)

| ID | Nome | Descrição |
|---|---|---|
| **RNF01** | Segurança e Efemeridade | Nenhum documento de usuário é persistido em disco ou banco relacional sem autorização expressa. |
| **RNF02** | Guardrails de Linguagem | Prompt calibrado para usar tom recomendatório e preventivo, sem acusações criminais ou juízos conclusivos de mérito. |
| **RNF03** | Responsividade e Usabilidade | Interface moderna compatível com desktops e celulares, com alternância de tema Claro e Escuro. |
| **RNF04** | Performance | Tempo de triagem do documento inferior a 5 segundos via API assíncrona. |

---

## 4. Contrato da API Backend (FastAPI)

### Endpoints Principais:
- `POST /api/v1/analyze`: Recebe o documento (PDF/TXT) via `multipart/form-data` e retorna a triagem completa.
- `POST /api/v1/analyze/text`: Recebe o texto do contrato via JSON.
- `GET /api/v1/lawyers`: Lista advogados com filtros por `area`, `state`, `city` e `search`.
- `GET /api/v1/lawyers/areas`: Retorna a lista de especialidades jurídicas cadastradas.
- `POST /api/v1/lawyers/register`: Cadastra um novo profissional no SaaS.
- `GET /api/v1/health`: Verifica a integridade da API.
