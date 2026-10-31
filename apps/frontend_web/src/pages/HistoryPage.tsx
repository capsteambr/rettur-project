import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConsultationRecord } from '../types/contract';
import { Dashboard } from '../components/Dashboard';

interface HistoryPageProps {
  history: ConsultationRecord[];
  onDeleteConsultation: (id: string) => void;
  onReset: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onDeleteConsultation,
  onReset,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);

  // Calcula tempo restante até a expiração na nuvem
  const getTimeRemaining = (expiresAt: string) => {
    const totalMs = new Date(expiresAt).getTime() - Date.now();
    if (totalMs <= 0) {
      return { expired: true, text: 'Expirado (Destruído da Nuvem)', percent: 0 };
    }
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Percentual restante assumindo janela de 3 dias (72 horas)
    const totalDurationMs = 3 * 24 * 60 * 60 * 1000;
    const percent = Math.max(5, Math.min(100, Math.round((totalMs / totalDurationMs) * 100)));

    if (days > 0) {
      return { expired: false, text: `${days}d e ${hours}h restantes`, percent };
    }
    return { expired: false, text: `${hours}h restantes`, percent };
  };

  // Se o usuário selecionou uma consulta do histórico para visualizar
  if (selectedRecord) {
    const remaining = getTimeRemaining(selectedRecord.expiresAt);

    return (
      <div className="py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Barra Superior de Navegação do Histórico */}
        <div className="bg-card border border-border-custom rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedRecord(null)}
              className="px-3 py-1.5 rounded-xl bg-secondary-bg hover:bg-card-hover border border-border-custom text-primary-text font-bold text-xs transition flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Voltar ao Histórico</span>
            </button>

            <div className="h-5 w-px bg-border-custom hidden sm:block"></div>

            <div>
              <h2 className="font-extrabold text-sm text-primary-text">
                {selectedRecord.contractType}
              </h2>
              <p className="text-xs text-secondary-text mt-0.5">
                Realizada em: {new Date(selectedRecord.createdAt).toLocaleDateString('pt-BR')}
                {selectedRecord.fileName ? ` • Arquivo: ${selectedRecord.fileName}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-secondary-text flex items-center gap-1.5 font-medium">
              <i className="fas fa-clock text-amber-400"></i>
              <span>Expira em: <strong className={remaining.expired ? 'text-rose-400' : 'text-primary-text'}>{remaining.text}</strong></span>
            </span>

            <button
              onClick={() => {
                if (window.confirm('Deseja excluir esta consulta definitivamente da nuvem e da memória agora?')) {
                  onDeleteConsultation(selectedRecord.id);
                  setSelectedRecord(null);
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition flex items-center gap-1.5"
            >
              <i className="fas fa-trash-can text-xs"></i>
              <span>Apagar da Nuvem</span>
            </button>
          </div>
        </div>

        {/* Relatório Completo via Dashboard */}
        <Dashboard
          analysis={selectedRecord.analysis}
          onReset={() => {
            setSelectedRecord(null);
            onReset();
          }}
        />
      </div>
    );
  }

  // Lista Pura de Histórico (Sem Consulta Ativa)
  return (
    <div className="py-8 px-4 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Topo do Histórico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 sm:p-6 rounded-2xl border border-border-custom shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-2xl shadow-sm shrink-0">
            <i className="fas fa-clock-rotate-left"></i>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary-text">
              Histórico de Análises
            </h1>
            <p className="text-xs text-secondary-text mt-0.5">
              Documentos analisados anteriormente com descarte automático da nuvem programado (LGPD).
            </p>
          </div>
        </div>

        <Link
          to="/cliente/pre-analise"
          className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-md shadow-accent/10 self-start sm:self-auto shrink-0"
        >
          <i className="fas fa-plus"></i>
          <span>Nova Pré-Análise</span>
        </Link>
      </div>

      {/* Lista de Registros */}
      {history.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border-custom rounded-2xl shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary-bg text-secondary-text mx-auto flex items-center justify-center text-3xl">
            <i className="fas fa-box-open"></i>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-primary-text">Seu Histórico está Vazio</h3>
            <p className="text-xs text-secondary-text max-w-sm mx-auto">
              Nenhuma análise de contrato salva no momento. Inicie uma nova pré-análise para visualizar o histórico aqui.
            </p>
          </div>
          <Link
            to="/cliente/pre-analise"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <i className="fas fa-file-contract"></i>
            <span>Iniciar Pré-Análise Agora</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((record) => {
            const remaining = getTimeRemaining(record.expiresAt);

            return (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-card border border-border-custom hover:border-accent/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Informações Principais */}
                <div className="space-y-2 flex-1">
                  <h3 className="font-extrabold text-primary-text text-sm sm:text-base">
                    {record.contractType}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-secondary-text flex-wrap">
                    <span>Realizada em: {new Date(record.createdAt).toLocaleDateString('pt-BR')}</span>

                    {record.fileName && (
                      <>
                        <span>•</span>
                        <span className="text-secondary-text">Arquivo: {record.fileName}</span>
                      </>
                    )}
                  </div>

                  {/* Barra de Expiração da Nuvem (LGPD) */}
                  <div className="pt-1 max-w-md">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-secondary-text flex items-center gap-1">
                        <i className="fas fa-hourglass-half text-amber-400 text-[10px]"></i>
                        <span>Tempo até descarte definitivo na nuvem (LGPD):</span>
                      </span>
                      <strong className={remaining.expired ? 'text-rose-400' : 'text-primary-text'}>
                        {remaining.text}
                      </strong>
                    </div>
                    <div className="w-full bg-border-custom h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          remaining.expired ? 'bg-rose-500' : 'bg-accent'
                        }`}
                        style={{ width: `${remaining.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                  >
                    <i className="fas fa-eye"></i>
                    <span>Ver Análise</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Deseja apagar permanentemente este contrato da nuvem?')) {
                        onDeleteConsultation(record.id);
                      }
                    }}
                    className="p-2 rounded-xl text-secondary-text hover:text-rose-400 hover:bg-rose-500/10 border border-border-custom hover:border-rose-500/30 transition text-xs"
                    title="Apagar da nuvem imediatamente"
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
