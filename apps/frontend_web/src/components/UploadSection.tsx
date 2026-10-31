import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Sparkles, Loader2, UserCheck, Settings } from 'lucide-react';
import { AppAIState, ModelInfo } from '../types/contract';

interface UploadSectionProps {
  onAnalyzeFile: (file: File) => void;
  onAnalyzeText: (text: string) => void;
  isLoading: boolean;
  aiState: AppAIState;
  onUpdateActiveProvider: (provider: 'gemini' | 'ollama' | 'openai') => void;
  onUpdateSelectedModel: (model: string) => void;
  onUpdateUserRole: (role: string) => void;
  onOpenSettings: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalyzeFile,
  onAnalyzeText,
  isLoading,
  aiState,
  onUpdateActiveProvider,
  onUpdateSelectedModel,
  onUpdateUserRole,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProvider = aiState.activeProvider;
  const currentProviderSettings = aiState[activeProvider];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        alert('Por favor, selecione um arquivo PDF ou arquivo de texto (.txt)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'file' && selectedFile) {
      onAnalyzeFile(selectedFile);
    } else if (activeTab === 'text' && pastedText.trim().length >= 30) {
      onAnalyzeText(pastedText.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Banner de Apresentação */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Auditoria prévia antes de assinar qualquer documento</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Entenda o contrato antes que ele te pegue de surpresa
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Descubra multas escondidas, cláusulas abusivas e pegadinhas em linguagem 100% clara, com total respeito à sua privacidade.
        </p>
      </div>

      {/* Card Principal de Formulário */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Abas: Arquivo vs Texto */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'file'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Enviar Arquivo (PDF / TXT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Colar Texto do Contrato</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {/* Conteúdo da Aba 1: Arquivo */}
          {activeTab === 'file' && (
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
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
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
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-900 text-base">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Clique ou arraste para trocar
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">
                      Arraste e solte o contrato aqui
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Suporta arquivos em formato <span className="font-semibold text-slate-700">PDF</span> ou <span className="font-semibold text-slate-700">TXT</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm hover:bg-slate-50"
                  >
                    Procurar no Computador
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Conteúdo da Aba 2: Texto */}
          {activeTab === 'text' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cole o texto completo ou cláusulas de dúvida:
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Ex: Cláusula 1ª: O presente instrumento tem por objeto a locação do imóvel residencial..."
                className="w-full rounded-xl border border-slate-300 p-4 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                <span>Mínimo de 30 caracteres</span>
                <span>{pastedText.length} caracteres digitados</span>
              </div>
            </div>
          )}

          {/* Barra Simplificada de Provedor e Modelo (Sem pedir chave aqui!) */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seleção do Papel do Usuário */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Seu papel no contrato:</span>
                </label>
                <select
                  value={aiState.user_role}
                  onChange={(e) => onUpdateUserRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="locatario / inquilino">Sou o Inquilino (Locatário)</option>
                  <option value="prestador de servicos / PJ / MEI">Sou Prestador de Serviços / MEI / PJ</option>
                  <option value="consumidor / comprador">Sou Consumidor / Comprador</option>
                  <option value="trabalhador / empregado">Sou Empregado / Colaborador</option>
                  <option value="tomador de emprestimo">Estou pegando um Empréstimo</option>
                  <option value="contratante leigo geral">Outro / Análise Geral</option>
                </select>
              </div>

              {/* Alternar Provedor Rapidamente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Motor de Inteligência:
                  </label>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Configurar Chaves</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateActiveProvider('gemini')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border ${
                      activeProvider === 'gemini'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>✨</span>
                    <span className="truncate">Gemini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateActiveProvider('ollama')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border ${
                      activeProvider === 'ollama'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>🦙</span>
                    <span className="truncate">Ollama</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateActiveProvider('openai')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border ${
                      activeProvider === 'openai'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>⚡</span>
                    <span className="truncate">OpenAI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Seletor de Modelo do Provedor Ativo */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500">
                    Modelo em uso ({activeProvider.toUpperCase()}):
                  </span>
                  {activeProvider === 'ollama' && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.2 rounded-full">
                      Privacidade Local
                    </span>
                  )}
                </div>

                {currentProviderSettings.availableModels && currentProviderSettings.availableModels.length > 0 ? (
                  <select
                    value={currentProviderSettings.selectedModel}
                    onChange={(e) => onUpdateSelectedModel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {currentProviderSettings.availableModels.map((m: ModelInfo) => (
                      <option key={m.id} value={m.id}>
                        {m.is_recommended ? `⭐ ${m.name} (Recomendado)` : m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {currentProviderSettings.selectedModel || 'gemini-flash-lite-latest'}
                    </span>
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold ml-2"
                    >
                      Listar outros modelos →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Submissão */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || (activeTab === 'file' ? !selectedFile : pastedText.trim().length < 30)}
              className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>Auditando o Contrato com {activeProvider.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <span>Auditar Contrato Agora</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
