import React, { useState } from 'react';
import { X, Key, Check, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AppAIState, ModelInfo } from '../types/contract';
import { testAndListModels } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiState: AppAIState;
  onSave: (newState: AppAIState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiState,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'gemini' | 'ollama' | 'openai'>('gemini');
  const [state, setState] = useState<AppAIState>(aiState);

  // Estados de teste para feedback
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    provider: string;
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentSettings = state[activeTab];

  const handleTestAndDiscover = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testAndListModels(
        activeTab,
        activeTab !== 'ollama' ? currentSettings.apiKey?.trim() || undefined : undefined,
        activeTab === 'ollama' ? currentSettings.baseUrl?.trim() || undefined : undefined
      );

      if (result.success) {
        setTestResult({
          provider: activeTab,
          success: true,
          message: result.message,
        });

        // Atualiza a lista de modelos do provedor atual
        setState((prev) => {
          const prevProvider = prev[activeTab];
          let selected = prevProvider.selectedModel;

          // Se a lista retornou modelos e o atual não está nela ou está vazio, seleciona o recomendado
          if (result.models.length > 0) {
            const hasCurrent = result.models.some((m) => m.id === selected);
            if (!hasCurrent || !selected) {
              const recommended = result.models.find((m) => m.is_recommended);
              selected = recommended ? recommended.id : result.models[0].id;
            }
          }

          return {
            ...prev,
            [activeTab]: {
              ...prevProvider,
              availableModels: result.models,
              selectedModel: selected,
            },
          };
        });
      } else {
        setTestResult({
          provider: activeTab,
          success: false,
          message: result.message,
        });
      }
    } catch (err: any) {
      setTestResult({
        provider: activeTab,
        success: false,
        message: err.message || 'Falha ao conectar com o serviço.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(state);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Topo do Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-base">
              ⚙️
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Central de Chaves & Conexões de IA
              </h3>
              <p className="text-xs text-slate-500">Configure suas APIs e modelos disponíveis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas dos Provedores */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('gemini');
              setTestResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'gemini'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>✨</span>
            <span>Google Gemini</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ollama');
              setTestResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ollama'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🦙</span>
            <span>Ollama Local</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('openai');
              setTestResult(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'openai'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>⚡</span>
            <span>OpenAI</span>
          </button>
        </div>

        {/* Formulário de Configuração do Provedor Selecionado */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {activeTab === 'ollama' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL do Servidor Ollama:
              </label>
              <input
                type="text"
                value={state.ollama.baseUrl || ''}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    ollama: { ...prev.ollama, baseUrl: e.target.value },
                  }))
                }
                placeholder="http://localhost:11434"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Roda localmente sem custos e com privacidade total de dados (LGPD).
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Chave de API ({activeTab === 'gemini' ? 'Google Gemini' : 'OpenAI'}):</span>
                <Key className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <input
                type="password"
                value={state[activeTab].apiKey || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setState((prev) => ({
                    ...prev,
                    [activeTab]: { ...prev[activeTab], apiKey: val },
                  }));
                }}
                placeholder={
                  activeTab === 'gemini'
                    ? 'AIzaSy... (Deixe em branco para usar a chave do .env)'
                    : 'sk-... (Deixe em branco para usar a chave do .env)'
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                A chave fica salva com segurança apenas no seu navegador.
              </p>
            </div>
          )}

          {/* Botão de Testar Conexão e Descobrir Modelos */}
          <div>
            <button
              type="button"
              onClick={handleTestAndDiscover}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Validando chave e buscando modelos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Testar Chave & Buscar Modelos Disponíveis</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback de Teste */}
          {testResult && testResult.provider === activeTab && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-snug">{testResult.message}</div>
            </div>
          )}

          {/* Seleção do Modelo Padrão deste Provedor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Modelo Padrão Selecionado:
            </label>

            {currentSettings.availableModels && currentSettings.availableModels.length > 0 ? (
              <select
                value={currentSettings.selectedModel}
                onChange={(e) => {
                  const val = e.target.value;
                  setState((prev) => ({
                    ...prev,
                    [activeTab]: { ...prev[activeTab], selectedModel: val },
                  }));
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {currentSettings.availableModels.map((m: ModelInfo) => (
                  <option key={m.id} value={m.id}>
                    {m.is_recommended ? `⭐ ${m.name} (Recomendado)` : m.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={currentSettings.selectedModel || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setState((prev) => ({
                    ...prev,
                    [activeTab]: { ...prev[activeTab], selectedModel: val },
                  }));
                }}
                placeholder={
                  activeTab === 'gemini'
                    ? 'gemini-flash-lite-latest'
                    : activeTab === 'ollama'
                    ? 'llama3.2'
                    : 'gpt-4o-mini'
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Na tela inicial você poderá alternar entre os modelos carregados com 1 clique.
            </p>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
