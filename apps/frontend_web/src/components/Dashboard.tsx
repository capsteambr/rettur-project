import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ContractAnalysisResponse, 
  AttentionPoint, 
  ContractStrength, 
  TimelineItem,
  Lawyer 
} from '../types/contract';
import { RiskBadge } from './RiskBadge';
import { 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  FileCheck2, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { fetchLawyers } from '../services/api';

interface DashboardProps {
  analysis: ContractAnalysisResponse;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, onReset }) => {
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [selectedRegion, setSelectedRegion] = useState<string>('TODAS');
  const [recommendedLawyers, setRecommendedLawyers] = useState<Lawyer[]>([]);
  const [isLoadingLawyers, setIsLoadingLawyers] = useState<boolean>(false);

  // Estado para o modal de contato na plataforma
  const [contactLawyer, setContactLawyer] = useState<Lawyer | null>(null);
  const [contactName, setContactName] = useState<string>('Carlos Andrade');
  const [contactPhone, setContactPhone] = useState<string>('(62) 98877-6655');
  const [contactEmail, setContactEmail] = useState<string>('carlos.andrade@email.com');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [shareSummary, setShareSummary] = useState<boolean>(true);
  const [isSubmittingContact, setIsSubmittingContact] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  const handleOpenContactModal = (lawyer: Lawyer) => {
    setContactLawyer(lawyer);
    setContactMessage(
      `Olá Dr(a). ${lawyer.name}, fiz a pré-análise do meu contrato de ${analysis.contract_type} pelo Rettur e gostaria de agendar uma consulta sobre os pontos de atenção identificados.`
    );
    setContactSuccess(false);
  };

  const handleSendPlatformContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
    }, 500);
  };

  useEffect(() => {
    const area = analysis.suggested_practice_areas?.[0] || '';
    setIsLoadingLawyers(true);
    fetchLawyers({
      area: area,
      state: selectedRegion === 'TODAS' ? undefined : selectedRegion,
    })
      .then((data) => {
        setRecommendedLawyers(data);
      })
      .catch(() => {
        setRecommendedLawyers([]);
      })
      .finally(() => {
        setIsLoadingLawyers(false);
      });
  }, [analysis, selectedRegion]);

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedQuestionIndex(index);
      setTimeout(() => setCopiedQuestionIndex(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const copyAllQuestionsWhatsApp = () => {
    const formatted = [
      `Olá! Estive revisando o nosso contrato (${analysis.contract_type}) e gostaria de esclarecer alguns pontos antes de assinar:`,
      '',
      ...analysis.actionable_questions.map((q, idx) => `${idx + 1}. ${q}`),
      '',
      'Aguardo seu retorno para prosseguirmos. Obrigado!'
    ].join('\n');
    copyToClipboard(formatted);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score <= 6) return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (score <= 8) return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Disclaimer Ético de Conformidade OAB */}
      <div className="bg-card border border-border-custom rounded-2xl p-4 flex items-start gap-3 shadow-sm text-xs">
        <i className="fas fa-scale-balanced text-accent text-base mt-0.5 shrink-0"></i>
        <div className="flex-1 leading-relaxed text-secondary-text">
          <strong className="text-primary-text block mb-0.5">Nota de Conformidade Ética e Preventiva:</strong>
          {analysis.ethical_disclaimer ||
            "Esta pré-análise possui caráter meramente informativo e de suporte à leitura. Não substitui consulta jurídica formal nem parecer privativo da advocacia (Lei 8.906/94)."}
        </div>
      </div>

      {/* Barra de Ação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border-custom shadow-sm">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary-text">
            Relatório de Pré-Análise & Triagem
          </span>
          <h2 className="text-xl font-extrabold text-primary-text flex items-center gap-2">
            <span>{analysis.contract_type}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-secondary-text hover:text-primary-text bg-secondary-bg hover:bg-card-hover border border-border-custom transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Analisar Outro Documento</span>
          </button>
        </div>
      </div>

      {/* Cartão de Resumo & Score de Atenção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score de Atenção */}
        <div className="bg-card rounded-2xl border border-border-custom p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <p className="text-xs font-extrabold uppercase tracking-wider text-secondary-text">
            Nível de Atenção Sugerido
          </p>

          <div className="my-4 flex flex-col items-center">
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center font-black text-4xl shadow-inner ${getScoreColor(
                analysis.risk_score
              )}`}
            >
              {analysis.risk_score}
              <span className="text-sm font-semibold text-secondary-text">/10</span>
            </div>
            <div className="mt-3">
              <RiskBadge level={analysis.risk_level} />
            </div>
          </div>

          <p className="text-xs text-secondary-text max-w-xs leading-relaxed">
            {analysis.risk_score <= 4
              ? 'Documento com termos aparentemente equilibrados. Poucos pontos de dúvida.'
              : analysis.risk_score <= 7
              ? 'Atenção recomendada. Há regras desfavoráveis que merecem alinhamento prévio.'
              : 'Revisão essencial. Há termos que exigem validação cautelosa com um advogado.'}
          </p>
        </div>

        {/* Resumo em Linguagem Humana */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-border-custom p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-5 h-5 text-accent" />
              <h3 className="font-extrabold text-primary-text text-base">
                Compreensão do Documento (Linguagem Direta)
              </h3>
            </div>
            <div className="text-sm text-secondary-text leading-relaxed space-y-3 whitespace-pre-line">
              {analysis.summary_plain_text}
            </div>
          </div>

          {analysis.suggested_practice_areas && analysis.suggested_practice_areas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-custom flex flex-wrap items-center justify-between gap-2 text-xs text-secondary-text">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-primary-text">Área Recomendada:</span>
                <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
                  {analysis.suggested_practice_areas.join(', ')}
                </span>
              </div>
              <Link to="/cliente/advogados" className="text-accent hover:underline font-bold">
                Ver advogados dessa área →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Pontos de Atenção (Amarelo/Laranja) vs Aspectos Equilibrados (Verde) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Pontos de Atenção & Recomendações (Tamanho Fixo & Scroll Interno) */}
        <div className="bg-card rounded-2xl border border-border-custom p-6 shadow-sm flex flex-col h-[540px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <h3 className="font-extrabold text-primary-text text-base">
                Pontos de Atenção & Recomendações ({analysis.weaknesses_and_traps.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              Revisar antes de assinar
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            {analysis.weaknesses_and_traps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-secondary-text">
                <i className="fas fa-circle-check text-3xl text-emerald-400 mb-2"></i>
                <p className="text-xs">Nenhum ponto crítico ou armadilha evidente identificado no documento.</p>
              </div>
            ) : (
              analysis.weaknesses_and_traps.map((point: AttentionPoint, idx: number) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border-custom bg-secondary-bg/60 overflow-hidden transition"
                  >
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="p-4 cursor-pointer hover:bg-secondary-bg transition flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[11px] font-extrabold text-secondary-text uppercase">
                            {point.clause_reference}
                          </span>
                          <RiskBadge level={point.severity} showIcon={false} />
                        </div>
                        <h4 className="font-bold text-primary-text text-sm">{point.title}</h4>
                        <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                          {point.plain_explanation}
                        </p>
                      </div>
                      <button className="text-secondary-text hover:text-primary-text mt-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-border-custom bg-card/60 space-y-3 text-xs">
                        <div>
                          <span className="font-bold text-secondary-text uppercase text-[10px]">
                            Texto constante no documento:
                          </span>
                          <p className="mt-1 font-mono text-secondary-text bg-secondary-bg p-2.5 rounded-lg border border-border-custom text-[11px]">
                            "{point.original_snippet}"
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase text-[10px] block mb-0.5">
                            💡 Recomendação Preventiva:
                          </span>
                          <p className="text-emerald-900 dark:text-emerald-200 font-medium">{point.recommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 2: Aspectos Equilibrados e Proteções (Tamanho Fixo & Scroll Interno) */}
        <div className="bg-card rounded-2xl border border-border-custom p-6 shadow-sm flex flex-col h-[540px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-primary-text text-base">
                Aspectos Equilibrados ({analysis.strengths.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              Garantias Ativas
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            {analysis.strengths.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-secondary-text">
                <i className="fas fa-info-circle text-3xl text-secondary-text mb-2"></i>
                <p className="text-xs">Nenhuma proteção expressa mapeada no texto fornecido.</p>
              </div>
            ) : (
              analysis.strengths.map((str: ContractStrength, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border-custom bg-secondary-bg/60"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-extrabold text-secondary-text uppercase">
                      {str.clause_reference}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Proteção Mapeada</span>
                  </div>
                  <h4 className="font-bold text-primary-text text-sm">{str.title}</h4>
                  <p className="text-xs text-secondary-text mt-1 leading-relaxed">{str.explanation}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Linha do Tempo e Prazos */}
      {analysis.timeline && analysis.timeline.length > 0 && (
        <div className="bg-card rounded-2xl border border-border-custom p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-primary-text text-base">
                Cronograma de Prazos e Vigências
              </h3>
              <p className="text-xs text-secondary-text">
                Fique atento aos prazos de pré-notificação e renovações automáticas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.timeline.map((item: TimelineItem, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border-custom bg-secondary-bg/50 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-accent mb-1">
                    {item.trigger_date_or_period}
                  </div>
                  <h4 className="font-bold text-primary-text text-sm">{item.event}</h4>
                  <p className="text-xs text-secondary-text mt-1">{item.metric_or_consequence}</p>
                </div>

                {item.alert && (
                  <div className="mt-3 pt-2 border-t border-border-custom text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded font-medium">
                    ⚠️ {item.alert}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perguntas Sugeridas para Negociação */}
      {analysis.actionable_questions && analysis.actionable_questions.length > 0 && (
        <div className="bg-secondary-bg border border-border-custom rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card border border-border-custom flex items-center justify-center text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-primary-text">
                  Perguntas Sugeridas para Esclarecer Antes de Assinar
                </h3>
                <p className="text-xs text-secondary-text">
                  Envie estas dúvidas para a outra parte ou leve ao seu advogado
                </p>
              </div>
            </div>

            <button
              onClick={copyAllQuestionsWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition shadow-sm self-start sm:self-auto"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Copiado para a área de transferência!' : 'Copiar Tudo para WhatsApp'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {analysis.actionable_questions.map((question: string, idx: number) => {
              const isCopied = copiedQuestionIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border-custom rounded-xl p-4 flex items-center justify-between gap-4 hover:border-accent/40 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/15 text-accent font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-primary-text leading-snug">{question}</p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(question, idx)}
                    className="p-2 rounded-lg bg-secondary-bg hover:bg-card-hover text-secondary-text hover:text-primary-text transition shrink-0"
                    title="Copiar apenas esta pergunta"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MÓDULO MARKETPLACE: Conexão com Advogados Credenciados com Filtro Regional */}
      <div className="bg-card border-2 border-accent/30 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center text-xl shrink-0">
              ⚖️
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-primary-text">
                Deseja parecer formal ou acompanhamento jurídico?
              </h3>
              <p className="text-xs text-secondary-text">
                Advogados credenciados pela OAB especialistas na área{' '}
                <strong className="text-accent">{analysis.suggested_practice_areas?.[0] || 'Contratual'}</strong>:
              </p>
            </div>
          </div>

          <Link
            to="/cliente/advogados"
            className="px-4 py-2 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-accent font-bold text-xs self-start sm:self-auto transition shrink-0"
          >
            Ver todos no diretório →
          </Link>
        </div>

        {/* Seletor de Região / Estado */}
        <div className="p-3.5 rounded-xl bg-secondary-bg/60 border border-border-custom flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-secondary-text font-bold">
            <i className="fas fa-location-dot text-accent"></i>
            <span>Ver Advogados por Região:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'TODAS', label: 'Todas as Regiões' },
              { id: 'GO', label: 'Goiás (GO)' },
              { id: 'SP', label: 'São Paulo (SP)' },
              { id: 'RJ', label: 'Rio de Janeiro (RJ)' },
              { id: 'DF', label: 'Distrito Federal (DF)' },
              { id: 'MG', label: 'Minas Gerais (MG)' },
            ].map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedRegion === reg.id
                    ? 'bg-accent text-slate-950 shadow-sm'
                    : 'bg-card hover:bg-card-hover text-secondary-text hover:text-primary-text border border-border-custom'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingLawyers ? (
          <div className="py-8 text-center text-xs text-secondary-text flex items-center justify-center gap-2">
            <i className="fas fa-spinner fa-spin text-accent"></i>
            <span>Buscando advogados especialistas na região...</span>
          </div>
        ) : recommendedLawyers.length === 0 ? (
          <div className="p-6 rounded-xl bg-secondary-bg/40 border border-dashed border-border-custom text-center space-y-2">
            <i className="fas fa-location-cross text-2xl text-secondary-text"></i>
            <p className="text-xs font-bold text-primary-text">
              Nenhum advogado encontrado especificamente na região {selectedRegion}.
            </p>
            <p className="text-xs text-secondary-text">
              Nossos especialistas oferecem atendimento online por videoconferência e WhatsApp para todo o território nacional.
            </p>
            <button
              onClick={() => setSelectedRegion('TODAS')}
              className="mt-2 px-4 py-1.5 rounded-lg bg-accent text-slate-950 text-xs font-bold hover:bg-accent-hover transition"
            >
              Ver Advogados de Todas as Regiões
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-secondary-bg border border-border-custom rounded-xl p-4 flex flex-col justify-between hover:border-accent/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-primary-text text-sm">{lawyer.name}</h4>
                    <span className="text-xs font-bold text-amber-400">★ {lawyer.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] font-mono text-secondary-text block mb-2">
                    {lawyer.oab} • <strong className="text-accent">{lawyer.city} - {lawyer.state}</strong>
                  </span>
                  <p className="text-xs text-secondary-text line-clamp-2 leading-relaxed mb-3">
                    {lawyer.bio}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <a
                    href={`https://wa.me/${lawyer.phone.replace(/[^0-9]/g, '')}?text=Olá,%20Dr(a).%20${encodeURIComponent(
                      lawyer.name
                    )},%20analisei%20um%20contrato%20na%20plataforma%20Rettur%20e%20gostaria%20de%20consultoria.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    title="Chamar no WhatsApp"
                  >
                    <i className="fab fa-whatsapp text-sm"></i>
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenContactModal(lawyer)}
                    className="py-2 px-2 rounded-lg bg-card hover:bg-card-hover border border-accent/40 hover:border-accent text-accent font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    title="Chamar na Plataforma Rettur"
                  >
                    <i className="fas fa-comments text-xs"></i>
                    <span>Na Plataforma</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Chamado na Plataforma */}
      {contactLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border-custom rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center text-sm">
                  <i className="fas fa-scale-balanced"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-primary-text text-sm sm:text-base">
                    Chamar Dr(a). {contactLawyer.name}
                  </h3>
                  <span className="text-[11px] text-secondary-text font-mono">
                    {contactLawyer.oab} • {contactLawyer.city} - {contactLawyer.state}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setContactLawyer(null)}
                className="text-secondary-text hover:text-primary-text p-1"
                aria-label="Fechar"
              >
                <i className="fas fa-xmark text-lg"></i>
              </button>
            </div>

            {contactSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
                  <i className="fas fa-check"></i>
                </div>
                <h4 className="font-black text-lg text-primary-text">
                  Chamado Enviado com Sucesso!
                </h4>
                <p className="text-xs text-secondary-text max-w-sm mx-auto leading-relaxed">
                  O Dr(a). <strong>{contactLawyer.name}</strong> recebeu sua solicitação diretamente no painel do advogado. Em breve você receberá retorno no contato informado.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setContactLawyer(null)}
                    className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition shadow-sm"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendPlatformContact} className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-secondary-bg/60 border border-border-custom flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary-text block">
                      Contrato Analisado:
                    </span>
                    <strong className="text-primary-text">{analysis.contract_type}</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                    {analysis.suggested_practice_areas?.[0] || 'Direito Civil'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-secondary-text mb-1">Seu Nome:</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ex: Carlos Andrade"
                      className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3 py-2 text-primary-text focus:outline-none focus:border-accent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-secondary-text mb-1">Telefone / WhatsApp:</label>
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(62) 99999-9999"
                      className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3 py-2 text-primary-text focus:outline-none focus:border-accent text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-secondary-text mb-1">Seu E-mail:</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3 py-2 text-primary-text focus:outline-none focus:border-accent text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-secondary-text mb-1">
                    Sua Mensagem ou Dúvida para o Advogado:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl p-3 text-primary-text focus:outline-none focus:border-accent text-xs leading-relaxed resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-card border border-border-custom">
                  <input
                    type="checkbox"
                    checked={shareSummary}
                    onChange={(e) => setShareSummary(e.target.checked)}
                    className="accent-accent w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-secondary-text">
                    Anexar os <strong>{analysis.weaknesses_and_traps.length} pontos de atenção</strong> identificados pela IA para agilizar o atendimento.
                  </span>
                </label>

                <p className="text-[10px] text-secondary-text leading-tight">
                  <i className="fas fa-shield-halved text-accent mr-1"></i>
                  Atendimento privativo e seguro em conformidade com o <strong>Provimento 205/2021 do CFOAB</strong>.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-custom">
                  <button
                    type="button"
                    onClick={() => setContactLawyer(null)}
                    className="px-4 py-2 rounded-xl text-secondary-text hover:text-primary-text hover:bg-secondary-bg text-xs font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition shadow-md shadow-accent/15 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span>Enviar Chamado na Plataforma</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
