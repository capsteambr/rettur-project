import React, { useState } from 'react';
import { 
  ContractAnalysisResponse, 
  ContractTrap, 
  ContractStrength, 
  TimelineItem 
} from '../types/contract';
import { RiskBadge } from './RiskBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  FileCheck2, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

interface DashboardProps {
  analysis: ContractAnalysisResponse;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, onReset }) => {
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [expandedTrapIndex, setExpandedTrapIndex] = useState<number | null>(0);

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
    if (score <= 3) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score <= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score <= 8) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Barra de Ação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Relatório de Auditoria Jurídica
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>{analysis.contract_type}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auditar Outro Contrato</span>
          </button>
        </div>
      </div>

      {/* Cartão de Resumo Executivo & Score de Risco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score de Risco */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Índice Geral de Risco
          </p>

          <div className="my-4 flex flex-col items-center">
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center font-black text-4xl shadow-inner ${getScoreColor(
                analysis.risk_score
              )}`}
            >
              {analysis.risk_score}
              <span className="text-sm font-semibold text-slate-400">/10</span>
            </div>
            <div className="mt-3">
              <RiskBadge level={analysis.risk_level} />
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-xs">
            {analysis.risk_score <= 4
              ? 'Contrato relativamente balanceado. Riscos pequenos identificados.'
              : analysis.risk_score <= 7
              ? 'Atenção necessária. Há termos desvantajosos que merecem negociação.'
              : 'Perigo iminente. Há cláusulas leoninas ou multas abusivas.'}
          </p>
        </div>

        {/* Resumo em Linguagem Humana */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                O Que É Este Contrato (Em Português Claro)
              </h3>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
              {analysis.summary_plain_text}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>🔍 Auditoria baseada no Código de Defesa do Consumidor e Código Civil</span>
          </div>
        </div>
      </div>

      {/* Grid Principal: Pegadinhas (Vermelho) vs Pontos Fortes (Verde) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Pegadinhas e Cláusulas Abusivas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Pegadinhas & Riscos ({analysis.weaknesses_and_traps.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Atenção redobrada
            </span>
          </div>

          <div className="space-y-4">
            {analysis.weaknesses_and_traps.map((trap: ContractTrap, idx: number) => {
              const isExpanded = expandedTrapIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-rose-100 bg-rose-50/30 overflow-hidden transition"
                >
                  <div
                    onClick={() => setExpandedTrapIndex(isExpanded ? null : idx)}
                    className="p-4 cursor-pointer hover:bg-rose-50/70 transition flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                          {trap.clause_reference}
                        </span>
                        <RiskBadge level={trap.severity} showIcon={false} />
                        {trap.ambiguity_detected && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Duplo Sentido
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{trap.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {trap.plain_explanation}
                      </p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 mt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-rose-100/80 bg-white/70 space-y-3 text-xs">
                      {/* Trecho Original */}
                      <div>
                        <span className="font-bold text-slate-500 uppercase text-[10px]">
                          Trecho literal do contrato:
                        </span>
                        <p className="mt-1 font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                          "{trap.original_snippet}"
                        </p>
                      </div>

                      {/* Recomendação de Ação */}
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="font-extrabold text-emerald-800 uppercase text-[10px] block mb-0.5">
                          💡 O que fazer / sugerir:
                        </span>
                        <p className="text-emerald-950 font-medium">{trap.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 2: Pontos Fortes e Proteções */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Pontos Fortes & Garantias ({analysis.strengths.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              A seu favor
            </span>
          </div>

          <div className="space-y-4">
            {analysis.strengths.map((str: ContractStrength, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                    {str.clause_reference}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700">Proteção Ativa</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{str.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{str.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Linha do Tempo: Prazos, Vencimentos e Multas */}
      {analysis.timeline && analysis.timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Linha do Tempo & Calendário de Obrigações
              </h3>
              <p className="text-xs text-slate-500">
                Datas limites para avisos, multas e índices de reajuste financeiro
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.timeline.map((item: TimelineItem, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-700 mb-1">
                    <span>{item.trigger_date_or_period}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.event}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.metric_or_consequence}</p>
                </div>

                {item.alert && (
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-amber-800 bg-amber-50 p-2 rounded">
                    ⚠️ {item.alert}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perguntas de Ouro: O que perguntar antes de assinar */}
      {analysis.actionable_questions && analysis.actionable_questions.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  Perguntas de Ouro para Fazer Antes de Assinar
                </h3>
                <p className="text-xs text-slate-300">
                  Envie estas dúvidas por mensagem ou e-mail para a outra parte
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
                  className="bg-white/10 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-white/15 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-100 leading-snug">{question}</p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(question, idx)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0"
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
    </div>
  );
};
