import React, { useState } from 'react';
import { UserSession, LawyerLead, LawyerReview } from '../types/contract';
import { RiskBadge } from '../components/RiskBadge';

interface LawyerDashboardPageProps {
  session: UserSession;
  onLogout: () => void;
}

const INITIAL_LEADS: LawyerLead[] = [
  {
    id: 'lead-1',
    clientName: 'Mariana Vasconcelos',
    clientPhone: '5562988112233',
    contractType: 'Locação Residencial Urbana',
    riskLevel: 'ALTO',
    date: 'Hoje, 15:42',
    status: 'NOVO',
    initialMessage: 'Olá Doutora, o Rettur apontou risco alto na cláusula 12ª de renovação automática e multa de 6 meses. Gostaria de uma consultoria para ajustar antes de assinar.',
  },
  {
    id: 'lead-2',
    clientName: 'Roberto Antunes (Empresário MEI)',
    clientPhone: '5562991223344',
    contractType: 'Prestação de Serviços de TI PJ',
    riskLevel: 'CRITICO',
    date: 'Hoje, 11:15',
    status: 'EM_ATENDIMENTO',
    initialMessage: 'Fiz a pré-análise do contrato do meu novo cliente e apareceu retenção indevida de código-fonte. Preciso de um parecer formal.',
  },
  {
    id: 'lead-3',
    clientName: 'Fernanda Lima Castro',
    clientPhone: '5562984556677',
    contractType: 'Compra e Venda de Imóvel na Planta',
    riskLevel: 'ALTO',
    date: 'Ontem, 17:30',
    status: 'CONTRATO_FECHADO',
    initialMessage: 'Vi seu perfil no diretório do Rettur como especialista imobiliária. Pode revisar o memorial descritivo da construtora?',
  },
  {
    id: 'lead-4',
    clientName: 'Lucas Mendonça',
    clientPhone: '5562997889900',
    contractType: 'Contrato de Parceria Comercial',
    riskLevel: 'MEDIO',
    date: '28 de Outubro',
    status: 'CONTRATO_FECHADO',
    initialMessage: 'Gostei dos prazos apontados na triagem, mas queria validar a responsabilidade solidária entre os sócios.',
  },
];

const INITIAL_REVIEWS: LawyerReview[] = [
  {
    id: 'rev-1',
    clientName: 'Mariana Vasconcelos',
    rating: 5,
    date: 'Ontem',
    contractCategory: 'Direito Imobiliário',
    comment: 'Atendimento impecável! O Rettur identificou uma multa abusiva e a advogada me orientou com exatidão sobre como contrapropor ao locador. Economizei milhares de reais.',
  },
  {
    id: 'rev-2',
    clientName: 'Carlos Eduardo Nogueira',
    rating: 5,
    date: '24 de Outubro',
    contractCategory: 'Direito do Trabalho',
    comment: 'Muito atenciosa e rápida no WhatsApp. Explicou em detalhes os riscos que a IA da plataforma havia marcado na cláusula de não-concorrência.',
  },
  {
    id: 'rev-3',
    clientName: 'Juliana Paes de Barros',
    rating: 5,
    date: '19 de Outubro',
    contractCategory: 'Direito Civil / Contratos',
    comment: 'Excelente profissional. Muito ética e transparente. A conexão pelo Rettur foi direta e em menos de 10 minutos já estávamos alinhando o contrato.',
  },
  {
    id: 'rev-4',
    clientName: 'Henrique Guimarães',
    rating: 4,
    date: '12 de Outubro',
    contractCategory: 'Direito Imobiliário',
    comment: 'Esclareceu as principais dúvidas de prazos de entrega do imóvel. Recomendo muito o trabalho!',
  },
];

export const LawyerDashboardPage: React.FC<LawyerDashboardPageProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'reviews' | 'profile'>('leads');
  const [leads, setLeads] = useState<LawyerLead[]>(INITIAL_LEADS);
  const [reviews] = useState<LawyerReview[]>(INITIAL_REVIEWS);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const handleUpdateLeadStatus = (leadId: string, newStatus: LawyerLead['status']) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );
  };

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 px-4 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Banner Superior do Advogado */}
      <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-3xl shadow-sm shrink-0">
            <i className="fas fa-user-tie"></i>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-primary-text">
                {session.name || 'Dra. Amanda Silveira'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <i className="fas fa-certificate text-[10px]"></i>
                <span>{session.oab || 'OAB/GO 54.321'} • Verificada</span>
              </span>
            </div>

            <p className="text-xs text-secondary-text mt-1 flex items-center gap-3 flex-wrap">
              <span>{session.email || 'amanda.silveira@adv.oab.org.br'}</span>
              <span>•</span>
              <span className="text-accent font-semibold">
                {session.subscriptionPlan || 'Plano Especialista (SaaS B2B)'}
              </span>
            </p>
          </div>
        </div>

        {/* Status de Disponibilidade & Ações */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-secondary-bg border-border-custom text-secondary-text'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{isOnline ? 'Online para Atendimento' : 'Modo Ocupado'}</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principais (KPIs do SaaS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pessoas que Chamaram */}
        <div className="p-5 rounded-2xl bg-card border border-border-custom shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary-text flex items-center justify-between">
            <span>Pessoas que Chamaram</span>
            <i className="fas fa-comments text-accent"></i>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-text">{leads.length}</span>
            <span className="text-xs font-bold text-emerald-400">+1 novo hoje</span>
          </div>
          <p className="text-[11px] text-secondary-text">Clientes que solicitaram contato via triagem</p>
        </div>

        {/* Avaliação Média */}
        <div className="p-5 rounded-2xl bg-card border border-border-custom shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary-text flex items-center justify-between">
            <span>Avaliação Média</span>
            <i className="fas fa-star text-amber-400"></i>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-text">{averageRating}</span>
            <span className="text-xs text-amber-400">★★★★★</span>
          </div>
          <p className="text-[11px] text-secondary-text">Baseado em {reviews.length} avaliações de clientes</p>
        </div>

        {/* Taxa de Resposta */}
        <div className="p-5 rounded-2xl bg-card border border-border-custom shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary-text flex items-center justify-between">
            <span>Taxa de Conversão</span>
            <i className="fas fa-chart-line text-blue-400"></i>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-text">75%</span>
            <span className="text-xs font-bold text-emerald-400">Alta</span>
          </div>
          <p className="text-[11px] text-secondary-text">Contratos formalizados após contato</p>
        </div>

        {/* Visualizações no Diretório */}
        <div className="p-5 rounded-2xl bg-card border border-border-custom shadow-sm space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary-text flex items-center justify-between">
            <span>Visitas no Perfil</span>
            <i className="fas fa-eye text-purple-400"></i>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-text">148</span>
            <span className="text-xs text-secondary-text font-normal">este mês</span>
          </div>
          <p className="text-[11px] text-secondary-text">Buscas por Direito Imobiliário e Civil</p>
        </div>
      </div>

      {/* Tabs Internas do Painel */}
      <div className="flex items-center gap-2 border-b border-border-custom pb-2">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'bg-accent text-slate-950 shadow-md shadow-accent/15'
              : 'text-secondary-text hover:text-primary-text bg-card hover:bg-card-hover border border-border-custom'
          }`}
        >
          <i className="fas fa-user-group"></i>
          <span>Pessoas que Chamaram ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-accent text-slate-950 shadow-md shadow-accent/15'
              : 'text-secondary-text hover:text-primary-text bg-card hover:bg-card-hover border border-border-custom'
          }`}
        >
          <i className="fas fa-star"></i>
          <span>Avaliações & Reputação ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-accent text-slate-950 shadow-md shadow-accent/15'
              : 'text-secondary-text hover:text-primary-text bg-card hover:bg-card-hover border border-border-custom'
          }`}
        >
          <i className="fas fa-sliders"></i>
          <span>Plano SaaS & Áreas</span>
        </button>
      </div>

      {/* Conteúdo da Aba 1: Leads / Pessoas que Chamaram */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-primary-text flex items-center gap-2">
              <i className="fas fa-inbox text-accent"></i>
              <span>Chamados Recentes de Clientes</span>
            </h3>
            <span className="text-xs text-secondary-text">
              Clientes que analisaram contratos e escolheram você no diretório
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-card border border-border-custom shadow-sm space-y-4 hover:border-accent/40 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-custom pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-bg border border-border-custom text-primary-text flex items-center justify-center font-bold text-sm">
                      {lead.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-primary-text text-sm">
                        {lead.clientName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-secondary-text">
                        <span>{lead.contractType}</span>
                        <span>•</span>
                        <span>{lead.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <RiskBadge level={lead.riskLevel} />
                    {/* Seletor de Status do Chamado */}
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleUpdateLeadStatus(lead.id, e.target.value as LawyerLead['status'])
                      }
                      className="bg-secondary-bg border border-border-custom text-xs rounded-xl px-2.5 py-1 text-secondary-text font-bold focus:outline-none focus:border-accent"
                    >
                      <option value="NOVO">● Novo Chamado</option>
                      <option value="EM_ATENDIMENTO">⏳ Em Atendimento</option>
                      <option value="CONTRATO_FECHADO">✓ Contrato Fechado</option>
                    </select>
                  </div>
                </div>

                {/* Mensagem do Cliente */}
                <div className="p-3.5 rounded-xl bg-secondary-bg/60 border border-border-custom text-xs text-secondary-text leading-relaxed">
                  <span className="font-bold text-primary-text block mb-1">
                    💬 Mensagem do Cliente:
                  </span>
                  "{lead.initialMessage}"
                </div>

                {/* Ações Diretas */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-secondary-text">
                    Telefone: <strong>+55 (62) 98811-2233</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${lead.clientPhone}?text=${encodeURIComponent(
                        `Olá ${lead.clientName}, sou a Dra. Amanda Silveira da plataforma Rettur. Recebi sua solicitação referente ao contrato de ${lead.contractType}. Como posso ajudar?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-sm"
                    >
                      <i className="fab fa-whatsapp text-sm"></i>
                      <span>Responder no WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 2: Avaliações dos Clientes */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Card Resumo de Avaliações */}
          <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="text-4xl font-black text-accent">{averageRating}</div>
              <div>
                <div className="text-amber-400 text-lg">★★★★★</div>
                <p className="text-xs text-secondary-text">
                  Classificação baseada em <strong>{reviews.length} avaliações</strong> verificadas de cidadãos
                </p>
              </div>
            </div>

            <div className="text-xs text-secondary-text space-y-1">
              <div className="flex items-center gap-2">
                <span>5 estrelas</span>
                <div className="w-32 bg-border-custom h-2 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[100%]" />
                </div>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Lista de Avaliações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-card border border-border-custom shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center">
                      {rev.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-primary-text">{rev.clientName}</h4>
                      <span className="text-[10px] text-secondary-text">{rev.date}</span>
                    </div>
                  </div>

                  <div className="text-amber-400 text-xs font-bold">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>

                <p className="text-xs text-secondary-text leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="pt-2 border-t border-border-custom flex items-center justify-between text-[10px] text-secondary-text">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-bg border border-border-custom text-accent font-semibold">
                    {rev.contractCategory}
                  </span>
                  <span className="text-emerald-400 font-bold">✓ Atendimento Verificado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 3: Plano SaaS & Configurações */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-primary-text flex items-center gap-2">
              <i className="fas fa-crown text-amber-400"></i>
              <span>Assinatura SaaS Ativa</span>
            </h3>

            <div className="p-4 rounded-xl bg-secondary-bg border border-border-custom space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary-text">Plano Atual:</span>
                <span className="font-bold text-accent text-xs">Plano Especialista</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary-text">Valor Mensal:</span>
                <span className="font-black text-primary-text text-sm">R$ 129,90 / mês</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary-text">Status do Pagamento:</span>
                <span className="text-xs font-bold text-emerald-400">✓ Ativo e Regular</span>
              </div>
            </div>

            <div className="text-xs text-secondary-text space-y-2">
              <p className="font-bold text-primary-text">Recursos inclusos no seu plano:</p>
              <p>✓ Até 3 especialidades no diretório com busca destacada</p>
              <p>✓ Recebimento ilimitado de leads com pré-análise do contrato</p>
              <p>✓ Painel completo de reputação e notas públicas</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border-custom shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-primary-text flex items-center gap-2">
              <i className="fas fa-briefcase text-accent"></i>
              <span>Áreas de Atuação Registradas</span>
            </h3>

            <div className="space-y-2">
              {['Direito Imobiliário', 'Direito Civil & Contratos', 'Direito do Consumidor'].map(
                (area, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-secondary-bg border border-border-custom flex items-center justify-between text-xs font-semibold text-primary-text"
                  >
                    <span>{area}</span>
                    <span className="text-emerald-400 text-xs">Ativa no Diretório</span>
                  </div>
                )
              )}
            </div>

            <p className="text-xs text-secondary-text">
              Para adicionar mais áreas de atuação estadual ou nacional, faça o upgrade para o{' '}
              <strong className="text-accent">Plano Escritório</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
