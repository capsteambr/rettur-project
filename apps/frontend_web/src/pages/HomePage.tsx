import React, { useState, useRef } from 'react';
import { AppAIState, ContractAnalysisResponse, ModelInfo } from '../types/contract';
import { Dashboard } from '../components/Dashboard';

interface HomePageProps {
  aiState: AppAIState;
  onUpdateActiveProvider: (provider: 'gemini' | 'ollama' | 'openai') => void;
  onUpdateSelectedModel: (model: string) => void;
  onUpdateUserRole: (role: string) => void;
  onOpenSettings: () => void;
  onAnalyzeFile: (file: File) => void;
  onAnalyzeText: (text: string) => void;
  analysis: ContractAnalysisResponse | null;
  isLoading: boolean;
  onReset: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  aiState,
  onUpdateActiveProvider,
  onUpdateSelectedModel,
  onUpdateUserRole,
  onOpenSettings,
  onAnalyzeFile,
  onAnalyzeText,
  analysis,
  isLoading,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [contractText, setContractText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProvider = aiState.activeProvider;
  const currentProviderSettings = aiState[activeProvider];

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
    if (activeTab === 'file' && selectedFile) {
      onAnalyzeFile(selectedFile);
    } else if (activeTab === 'text' && contractText.trim().length >= 20) {
      onAnalyzeText(contractText.trim());
    }
  };

  if (analysis) {
    return (
      <div className="py-8 px-4">
        <Dashboard analysis={analysis} onReset={onReset} />
      </div>
    );
  }

  return (
    <div className="hero-grid-pattern min-h-[calc(100vh-64px)] flex flex-col justify-between relative overflow-hidden">
      {/* Conteúdo Central */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-12 pb-20 relative z-10 flex-1 flex flex-col justify-center">
        {/* Topo / Título Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border-custom text-xs font-semibold text-secondary-text mb-4 shadow-sm">
            <span className="text-accent font-bold">● BYO-AI</span>
            <span>Auditoria jurídica gratuita para pessoas leigas</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-primary-text mb-3">
            Condinome <span className="text-accent">Panda</span>
          </h1>

          <p className="text-base sm:text-lg text-secondary-text max-w-2xl mx-auto leading-relaxed">
            A forma mais rápida, segura e independente de auditar <strong>contratos e termos de adesão</strong>.
            Descubra pegadinhas, duplo sentido e multas abusivas antes de assinar.
          </p>
        </div>

        {/* Card de Pesquisa Centralizado (Estilo Google Potente) */}
        <div className="bg-card border border-border-custom rounded-2xl shadow-2xl p-2 sm:p-3 transition-all duration-200">
          {/* Seletor Superior Interno: Colar Texto vs Upload PDF */}
          <div className="flex items-center justify-between border-b border-border-custom pb-2 px-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold">
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
            </div>

            {/* Indicador de Provedor Ativo */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-secondary-text">
              <span>Motor:</span>
              <span className="font-bold text-accent uppercase">{activeProvider}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-3">
            {activeTab === 'text' ? (
              <div className="relative">
                <textarea
                  rows={4}
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Cole aqui o trecho ou o contrato completo (ex: Cláusula 1ª: O locatário pagará multa de 6 meses em caso de saída antecipada...)"
                  className="w-full bg-transparent text-primary-text placeholder:text-secondary-text/60 text-sm font-sans focus:outline-none resize-none p-2 leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-secondary-text px-2 pt-1 border-t border-border-custom/50">
                  <span>Mínimo 20 caracteres</span>
                  <span>{contractText.length} caracteres</span>
                </div>
              </div>
            ) : (
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
                    <p className="text-xs">Extração em memória segura e sem persistência (LGPD)</p>
                  </div>
                )}
              </div>
            )}

            {/* Barra de Controles Rápidos: Papel, IA & Botão de Pesquisa */}
            <div className="mt-4 pt-3 border-t border-border-custom flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Opções de Provedores e Modelo */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Seletor de Papel */}
                <select
                  value={aiState.user_role}
                  onChange={(e) => onUpdateUserRole(e.target.value)}
                  className="bg-secondary-bg border border-border-custom text-secondary-text text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-accent"
                >
                  <option value="locatario / inquilino">👤 Sou o Inquilino</option>
                  <option value="prestador de servicos / PJ / MEI">💼 Sou Prestador / MEI</option>
                  <option value="consumidor / comprador">🛒 Sou Consumidor</option>
                  <option value="trabalhador / empregado">👔 Sou Empregado</option>
                  <option value="contratante leigo geral">📋 Análise Geral</option>
                </select>

                {/* Alternador de Provedor */}
                <div className="flex items-center bg-secondary-bg border border-border-custom rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => onUpdateActiveProvider('gemini')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeProvider === 'gemini'
                        ? 'bg-accent text-slate-950 shadow-sm'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateActiveProvider('ollama')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeProvider === 'ollama'
                        ? 'bg-accent text-slate-950 shadow-sm'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    Ollama
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateActiveProvider('openai')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeProvider === 'openai'
                        ? 'bg-accent text-slate-950 shadow-sm'
                        : 'text-secondary-text hover:text-primary-text'
                    }`}
                  >
                    OpenAI
                  </button>
                </div>

                {/* Botão de Ajustar Configurações */}
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="p-2 rounded-xl text-secondary-text hover:text-primary-text bg-secondary-bg border border-border-custom hover:border-accent transition text-xs"
                  title="Configurar Chaves e Modelos"
                >
                  <i className="fas fa-sliders text-xs"></i>
                </button>

                {/* Dropdown de Modelo */}
                {currentProviderSettings.availableModels && currentProviderSettings.availableModels.length > 0 && (
                  <select
                    value={currentProviderSettings.selectedModel}
                    onChange={(e) => onUpdateSelectedModel(e.target.value)}
                    className="bg-secondary-bg border border-border-custom text-secondary-text text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-accent max-w-[160px] truncate"
                  >
                    {currentProviderSettings.availableModels.map((m: ModelInfo) => (
                      <option key={m.id} value={m.id}>
                        {m.is_recommended ? `⭐ ${m.name}` : m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Botão de Pesquisa Principal */}
              <button
                type="submit"
                disabled={isLoading || (activeTab === 'file' ? !selectedFile : contractText.trim().length < 20)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-border-custom disabled:cursor-not-allowed text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-accent/15"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Auditando...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magnifying-glass"></i>
                    <span>Auditar Documento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Faixa de Recursos (Features Strip do Rodapé da Hero - Estilo Modelo) */}
      <div className="w-full border-t border-border-custom bg-card/60 backdrop-blur-sm relative z-10 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-secondary-text">
          <div className="flex items-center gap-2">
            <i className="fas fa-bolt text-accent"></i>
            <span>Auditoria Cognitiva em Segundos</span>
          </div>

          <div className="flex items-center gap-2">
            <i className="fas fa-shield-halved text-accent"></i>
            <span>100% Privado (Suporta IA Local e LGPD)</span>
          </div>

          <div className="flex items-center gap-2">
            <i className="fas fa-triangle-exclamation text-amber-400"></i>
            <span>Caça Pegadinhas e Cláusulas Abusivas</span>
          </div>

          <div className="flex items-center gap-2">
            <i className="fas fa-comment-dots text-emerald-400"></i>
            <span>Perguntas de Negociação Prontas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
