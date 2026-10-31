import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const PlansPricingPage: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState<'lawyers' | 'clients'>('lawyers');

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 max-w-6xl mx-auto space-y-12 animate-fade-in">
      {/* Topo / Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold shadow-sm">
          <i className="fas fa-coins"></i>
          <span>Modelo de Monetização & Viabilidade Econômica</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-text tracking-tight">
          Planos Transparentes para Cada Necessidade
        </h1>

        <p className="text-sm sm:text-base text-secondary-text max-w-2xl mx-auto leading-relaxed">
          O <strong>Rettur</strong> conecta a demanda do cidadão à advocacia qualificada com sustentabilidade financeira,
          baixo custo de infraestrutura e alta margem de contribuição.
        </p>

        {/* Alternador de Público: Advogados vs Clientes */}
        <div className="inline-flex p-1.5 rounded-2xl bg-secondary-bg border border-border-custom shadow-inner">
          <button
            onClick={() => setTargetAudience('lawyers')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              targetAudience === 'lawyers'
                ? 'bg-accent text-slate-950 shadow-md shadow-accent/15'
                : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            <i className="fas fa-scale-balanced"></i>
            <span>Para Advogados & Casas Jurídicas</span>
          </button>

          <button
            onClick={() => setTargetAudience('clients')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              targetAudience === 'clients'
                ? 'bg-accent text-slate-950 shadow-md shadow-accent/15'
                : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            <i className="fas fa-users"></i>
            <span>Para Cidadãos & PMEs</span>
          </button>
        </div>
      </div>

      {/* PLANOS PARA ADVOGADOS E CASAS DE ADVOCACIA */}
      {targetAudience === 'lawyers' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plano 1: Advogado Solo */}
            <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm flex flex-col justify-between hover:border-accent/40 transition">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-secondary-text tracking-wider">
                    Iniciante / Autônomo
                  </span>
                  <h3 className="text-lg font-black text-primary-text">Advogado Solo</h3>
                  <p className="text-xs text-secondary-text">
                    Ideal para advogados autônomos iniciando carteira de clientes.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-custom">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary-text">R$ 79,90</span>
                    <span className="text-xs text-secondary-text">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-secondary-text pt-2">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Perfil verificado com número da OAB e bio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span><strong>1 área de atuação</strong> no diretório</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Até <strong>15 contatos diretos</strong> de clientes/mês</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Botão de WhatsApp direto no perfil</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/advogado/login"
                className="mt-6 w-full py-2.5 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-primary-text font-bold text-xs transition text-center"
              >
                Começar Solo
              </Link>
            </div>

            {/* Plano 2: Advogado Especialista (Destaque) */}
            <div className="p-6 rounded-2xl bg-card border-2 border-accent shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                Mais Escolhido
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-accent tracking-wider">
                    Profissional Consolidado
                  </span>
                  <h3 className="text-lg font-black text-primary-text">Especialista</h3>
                  <p className="text-xs text-secondary-text">
                    Máxima visibilidade em triagens contratuais da sua região.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-custom">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-accent">R$ 149,90</span>
                    <span className="text-xs text-secondary-text">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-secondary-text pt-2">
                  <li className="flex items-start gap-2 text-primary-text font-medium">
                    <i className="fas fa-star text-amber-400 mt-0.5 shrink-0"></i>
                    <span><strong>Prioridade máxima</strong> em recomendações pós-análise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Até <strong>3 áreas de especialidade</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span><strong>Leads e chamados ilimitados</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Painel de avaliações públicas e reputação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Recebimento com resumo pré-analisado pelo cliente</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/advogado/login"
                className="mt-6 w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition text-center shadow-lg shadow-accent/15"
              >
                Assinar Especialista
              </Link>
            </div>

            {/* Plano 3: Escritório Médio / Boutique */}
            <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm flex flex-col justify-between hover:border-accent/40 transition">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-secondary-text tracking-wider">
                    Sociedades & Boutiques
                  </span>
                  <h3 className="text-lg font-black text-primary-text">Escritório Médio</h3>
                  <p className="text-xs text-secondary-text">
                    Para bancas de 3 a 5 associados com distribuição de chamados.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-custom">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary-text">R$ 349,90</span>
                    <span className="text-xs text-secondary-text">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-secondary-text pt-2">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Até <strong>5 advogados associados</strong> (OABs vinculadas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Distribuição de leads por especialidade do sócio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Abrangência em <strong>todo o estado</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Selo de Escritório Parceiro Verificado</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/advogado/login"
                className="mt-6 w-full py-2.5 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-primary-text font-bold text-xs transition text-center"
              >
                Cadastrar Escritório
              </Link>
            </div>

            {/* Plano 4: Grande Escritório / Casa Jurídica */}
            <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm flex flex-col justify-between hover:border-accent/40 transition">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-secondary-text tracking-wider">
                    Full Service
                  </span>
                  <h3 className="text-lg font-black text-primary-text">Casa de Advocacia</h3>
                  <p className="text-xs text-secondary-text">
                    Bancas de grande porte com atuação nacional e múltiplos setores.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-custom">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary-text">R$ 799,90</span>
                    <span className="text-xs text-secondary-text">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-secondary-text pt-2">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span><strong>Advogados ilimitados</strong> na mesma conta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Todas as áreas do direito em <strong>âmbito nacional</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Integração de leads via <strong>API e Webhook</strong> para CRM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Gerente de contas dedicado e suporte VIP</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/advogado/login"
                className="mt-6 w-full py-2.5 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-primary-text font-bold text-xs transition text-center"
              >
                Falar com Consultor
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PLANOS PARA CIDADÃOS & PMES */}
      {targetAudience === 'clients' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plano Gratuito Cidadão */}
            <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-secondary-text tracking-wider">
                    Cidadão Comum
                  </span>
                  <h3 className="text-lg font-black text-primary-text">Gratuito</h3>
                  <p className="text-xs text-secondary-text">
                    Perfeito para quem precisa analisar um contrato de aluguel ou compra esporadicamente.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-custom">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary-text">R$ 0</span>
                    <span className="text-xs text-secondary-text">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-secondary-text pt-2">
                  <li className="flex items-start gap-2 text-primary-text font-bold">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>10 consultas gratuitas por mês</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Relatório preventivo completo com pontuação de 1 a 10</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Cronograma de datas críticas e perguntas para o locador/parte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Busca livre no diretório de advogados com OAB</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/cliente/login"
                className="mt-6 w-full py-2.5 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-primary-text font-bold text-xs transition text-center"
              >
                Acessar Gratuitamente
              </Link>
            </div>

            {/* Plano Pro / Autônomo */}
            <div className="p-6 rounded-2xl bg-card border-2 border-accent shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                Mais Popular
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-accent tracking-wider">
                    Profissionais & MEI
                  </span>
                  <h3 className="text-lg font-black text-primary-text">Cliente Pro</h3>
                  <p className="text-xs text-secondary-text">
                    Ideal para freelancers, corretores, MEIs e pequenas negociações frequentes.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-custom">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-accent">R$ 29,90</span>
                    <span className="text-xs text-secondary-text">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-secondary-text pt-2">
                  <li className="flex items-start gap-2 text-primary-text font-bold">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Consultas ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Exportação de laudos executivos em PDF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Comparativo de minutas contratuais lado a lado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Histórico estendido de até 30 dias na nuvem</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/cliente/login"
                className="mt-6 w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition text-center shadow-lg shadow-accent/15"
              >
                Assinar Plano Pro
              </Link>
            </div>

            {/* Plano Empresarial / PME */}
            <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-secondary-text tracking-wider">
                    Empresas & Startups
                  </span>
                  <h3 className="text-lg font-black text-primary-text">Empresarial PME</h3>
                  <p className="text-xs text-secondary-text">
                    Triagem automatizada de contratos de fornecedores e parceiros para seu time.
                  </p>
                </div>

                <div className="pt-2 border-t border-border-custom">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary-text">R$ 149,90</span>
                    <span className="text-xs text-secondary-text">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-secondary-text pt-2">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Até <strong>5 usuários</strong> da empresa com acessos individuais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Triagem em lote (múltiplos PDFs simultâneos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Alertas automáticos de vencimento e renovação por e-mail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-accent mt-0.5 shrink-0"></i>
                    <span>Encaminhamento corporativo prioritário a bancas parceiras</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/cliente/login"
                className="mt-6 w-full py-2.5 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-primary-text font-bold text-xs transition text-center"
              >
                Cadastrar Empresa
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ESTUDO DE VIABILIDADE TÉCNICA E CUSTO DE CONSTRUÇÃO (PARA PITCH / BANCA) */}
      <div className="bg-card border border-border-custom rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border-custom pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-lg">
            <i className="fas fa-calculator"></i>
          </div>
          <div>
            <h2 className="text-lg font-black text-primary-text">
              Estudo de Viabilidade Econômica, Construção & Margem (Unit Economics)
            </h2>
            <p className="text-xs text-secondary-text">
              Demonstrativo de custos de engenharia, inferência de LLM e ponto de equilíbrio (Break-Even)
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-secondary-bg border border-border-custom space-y-1">
            <span className="text-secondary-text font-bold block">Custo Médio de IA por Consulta</span>
            <span className="text-2xl font-black text-emerald-400">R$ 0,007</span>
            <p className="text-[11px] text-secondary-text">
              ~6.000 tokens com Gemini Flash / modelo destilado. Menos de 1 centavo por documento.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary-bg border border-border-custom space-y-1">
            <span className="text-secondary-text font-bold block">Infraestrutura Mensal (Cloud)</span>
            <span className="text-2xl font-black text-primary-text">~R$ 280,00</span>
            <p className="text-[11px] text-secondary-text">
              FastAPI Docker em container elástico + CDN estática + PostgreSQL gerenciado.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary-bg border border-border-custom space-y-1">
            <span className="text-secondary-text font-bold block">Ponto de Equilíbrio (Break-Even)</span>
            <span className="text-2xl font-black text-accent">2 Assinantes</span>
            <p className="text-[11px] text-secondary-text">
              Apenas 2 advogados no Plano Especialista pagam 100% dos custos operacionais fixos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary-bg border border-border-custom space-y-1">
            <span className="text-secondary-text font-bold block">Margem Bruta Estimada</span>
            <span className="text-2xl font-black text-emerald-400">91,4%</span>
            <p className="text-[11px] text-secondary-text">
              Altíssimo retorno operacional com ganho de escala marginal praticamente zero.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary-bg/60 border border-border-custom text-xs text-secondary-text space-y-2">
          <p className="font-bold text-primary-text flex items-center gap-2">
            <i className="fas fa-shield-halved text-accent text-xs"></i>
            <span>Conformidade Ética com o Provimento nº 205/2021 da OAB:</span>
          </p>
          <p className="leading-relaxed">
            A monetização da plataforma <strong>não cobra comissão ou percentual sobre honorários advocatícios</strong>{' '}
            (o que violaria frontalmente o Código de Ética e Disciplina da OAB). Os advogados e sociedades remuneram a plataforma{' '}
            estritamente pela <strong>assinatura mensal de software (SaaS)</strong> pelo uso das ferramentas de visibilidade, tecnologia de triagem e gestão de reputação.
          </p>
        </div>
      </div>
    </div>
  );
};
