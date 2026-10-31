import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ContractAnalysisResponse } from '../types/contract';
import { Dashboard } from '../components/Dashboard';
import { TermsModal } from '../components/TermsModal';

interface HomePageProps {
  userRole: string;
  onUpdateUserRole: (role: string) => void;
  onAnalyzeFile: (file: File) => void;
  onAnalyzeText: (text: string) => void;
  analysis: ContractAnalysisResponse | null;
  isLoading: boolean;
  onReset?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userRole,
  onUpdateUserRole,
  onAnalyzeFile,
  onAnalyzeText,
  analysis,
  isLoading,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [contractText, setContractText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setActiveTab('file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setActiveTab('file');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setIsTermsModalOpen(true);
      return;
    }
    if (activeTab === 'file' && selectedFile) {
      onAnalyzeFile(selectedFile);
    } else if (activeTab === 'text' && contractText.trim().length >= 20) {
      onAnalyzeText(contractText.trim());
    }
  };

  if (analysis) {
    return (
      <div className="py-8 px-4 max-w-6xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border-custom text-xs">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-accent"></i>
            <span className="text-secondary-text">
              Análise concluída com sucesso e armazenada temporariamente no seu histórico.
            </span>
          </div>
          <Link
            to="/cliente/historico"
            className="text-accent font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Ver no Histórico</span>
            <i className="fas fa-arrow-right text-[10px]"></i>
          </Link>
        </div>
        <Dashboard analysis={analysis} onReset={onReset || (() => {})} />
      </div>
    );
  }

  return (
    <div className="hero-grid-pattern min-h-[calc(100vh-64px)] flex flex-col justify-between relative overflow-hidden">
      {/* Modal de Termos de Uso e LGPD */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => setAcceptedTerms(true)}
      />

      {/* Conteúdo Central */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-10 pb-16 relative z-10 flex-1 flex flex-col justify-center">
        {/* Topo / Título Hero */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-2xl shadow-sm">
              <i className="fas fa-scale-balanced"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-primary-text">
              Rettur
            </h1>
          </div>

          <p className="text-base sm:text-lg text-secondary-text max-w-2xl mx-auto leading-relaxed">
            A forma mais rápida e segura de entender <strong>contratos e termos de adesão</strong>.
            Descubra pontos de atenção, prazos críticos e conecte-se com advogados especialistas da sua região.
          </p>
        </div>

        {/* Card de Pesquisa Centralizado (Estilo Google Potente) */}
        <div className="bg-card border border-border-custom rounded-2xl shadow-2xl p-2 sm:p-3 transition-all duration-200">
          {/* Seletor Superior Interno: Upload PDF (Primeiro) vs Colar Texto */}
          <div className="flex items-center justify-between border-b border-border-custom pb-2 px-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'file'
                    ? 'bg-secondary-bg text-accent font-extrabold border border-border-custom'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                <i className="fas fa-file-pdf"></i>
                <span>Enviar PDF / TXT</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'text'
                    ? 'bg-secondary-bg text-accent font-extrabold border border-border-custom'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                <i className="fas fa-keyboard"></i>
                <span>Colar Texto</span>
              </button>
            </div>

            <div className="text-[11px] text-secondary-text">
              <span>Limite: 10 consultas gratuitas/mês</span>
            </div>
          </div>

          {/* Aviso Explícito de IA e LGPD na área de envio */}
          <div className="mx-3 mt-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2.5">
            <i className="fas fa-triangle-exclamation text-sm mt-0.5 flex-shrink-0"></i>
            <div className="leading-relaxed">
              <span className="font-bold">Aviso sobre os Dados & Inteligência Artificial: </span>
              Os dados gerados por IA são meramente informativos para apoio preliminar à leitura e{' '}
              <strong>não possuem validade jurídica formal</strong> nem substituem consulta com advogado.
              Processamento em memória volátil com total conformidade à <strong>LGPD</strong>.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-3">
            {activeTab === 'file' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  dragOver
                    ? 'border-accent bg-accent/10'
                    : selectedFile
                    ? 'border-accent/60 bg-accent/5'
                    : 'border-border-custom hover:border-secondary-text bg-secondary-bg/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center gap-3 text-accent font-bold text-sm">
                    <i className="fas fa-file-circle-check text-2xl"></i>
                    <div className="text-left">
                      <p className="text-primary-text">{selectedFile.name}</p>
                      <p className="text-xs text-secondary-text font-normal">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Clique para trocar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-secondary-text">
                    <i className="fas fa-cloud-arrow-up text-3xl text-accent"></i>
                    <p className="text-sm font-bold text-primary-text">
                      Arraste seu arquivo PDF ou clique aqui
                    </p>
                    <p className="text-xs">Processamento temporário em memória sem persistência (LGPD)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <textarea
                  rows={5}
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Cole aqui o trecho ou o contrato completo para pré-análise imediata..."
                  className="w-full bg-transparent text-primary-text placeholder:text-secondary-text/60 text-sm font-sans focus:outline-none resize-none p-2 leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-secondary-text px-2 pt-1 border-t border-border-custom/50">
                  <span>Mínimo 20 caracteres</span>
                  <span>{contractText.length} caracteres</span>
                </div>
              </div>
            )}

            {/* Checkbox de Termos de Uso e LGPD Obrigatório */}
            <div className="mt-3 px-1 flex items-start gap-2.5 text-xs text-secondary-text">
              <input
                type="checkbox"
                id="terms_agree"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border-custom text-accent focus:ring-accent accent-accent cursor-pointer"
              />
              <label htmlFor="terms_agree" className="cursor-pointer select-none">
                Li e concordo com os{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-accent underline font-semibold hover:text-accent-hover"
                >
                  Termos de Uso, Isenção de IA & Política de Privacidade (LGPD)
                </button>
                , ciente de que as respostas não constituem parecer jurídico conclusivo.
              </label>
            </div>

            {/* Barra de Controles Rápidos: Papel do Usuário & Botão Principal */}
            <div className="mt-4 pt-3 border-t border-border-custom flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Seletor de Papel do Usuário */}
              <div className="w-full sm:w-auto">
                <select
                  value={userRole}
                  onChange={(e) => onUpdateUserRole(e.target.value)}
                  className="w-full sm:w-auto bg-secondary-bg border border-border-custom text-secondary-text text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-accent"
                >
                  <option value="locatario / inquilino">👤 Sou o Inquilino (Locatário)</option>
                  <option value="prestador de servicos / PJ / MEI">💼 Sou Prestador / MEI / PJ</option>
                  <option value="consumidor / comprador">🛒 Sou Consumidor / Comprador</option>
                  <option value="trabalhador / empregado">👔 Sou Empregado / Colaborador</option>
                  <option value="contratante leigo geral">📋 Análise Geral de Contrato</option>
                </select>
              </div>

              {/* Botão de Análise Principal */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !acceptedTerms ||
                  (activeTab === 'file' ? !selectedFile : contractText.trim().length < 20)
                }
                className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-border-custom disabled:cursor-not-allowed text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-accent/15"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Realizando Triagem do Documento...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magnifying-glass"></i>
                    <span>Analisar Documento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Faixa de Recursos no Rodapé da Hero */}
      <div className="w-full border-t border-border-custom bg-card/60 backdrop-blur-sm relative z-10 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-secondary-text">
          <div className="flex items-center gap-2">
            <i className="fas fa-bolt text-accent"></i>
            <span>Triagem Prévia em Segundos</span>
          </div>

          <Link
            to="/seguranca"
            className="flex items-center gap-2 hover:text-accent transition group"
          >
            <i className="fas fa-shield-halved text-accent group-hover:scale-110 transition-transform"></i>
            <span>Privacidade, Prompt Injection & LGPD</span>
          </Link>

          <div className="flex items-center gap-2">
            <i className="fas fa-clipboard-check text-emerald-400"></i>
            <span>Pontos de Atenção & Prazos Críticos</span>
          </div>

          <div className="flex items-center gap-2">
            <i className="fas fa-scale-balanced text-accent"></i>
            <span>Conexão com Advogados da OAB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
