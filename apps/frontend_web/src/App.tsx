import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { ExampleContractsModal } from './components/ExampleContractsModal';
import { ContractAnalysisResponse, AppAIState, AIProviderConfig } from './types/contract';
import { analyzeContractFile, analyzeContractText, checkServerHealth } from './services/api';
import { AlertCircle } from 'lucide-react';

const DEFAULT_AI_STATE: AppAIState = {
  activeProvider: 'gemini',
  user_role: 'locatario / inquilino',
  gemini: {
    apiKey: '',
    selectedModel: 'gemini-flash-lite-latest',
    availableModels: [],
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    selectedModel: 'llama3.2',
    availableModels: [],
  },
  openai: {
    apiKey: '',
    selectedModel: 'gpt-4o-mini',
    availableModels: [],
  },
};

export const App: React.FC = () => {
  const [aiState, setAiState] = useState<AppAIState>(() => {
    const saved = localStorage.getItem('condinome_panda_ai_state_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_AI_STATE;
      }
    }
    return DEFAULT_AI_STATE;
  });

  const [analysis, setAnalysis] = useState<ContractAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    localStorage.setItem('condinome_panda_ai_state_v2', JSON.stringify(aiState));
  }, [aiState]);

  useEffect(() => {
    checkServerHealth().then(setServerOnline);
    const interval = setInterval(() => {
      checkServerHealth().then(setServerOnline);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getActiveConfig = (): AIProviderConfig => {
    const provider = aiState.activeProvider;
    const current = aiState[provider];
    return {
      provider,
      model_name: current.selectedModel || undefined,
      api_key: provider !== 'ollama' ? current.apiKey?.trim() || undefined : undefined,
      base_url: provider === 'ollama' ? current.baseUrl?.trim() || undefined : undefined,
      user_role: aiState.user_role,
    };
  };

  const handleAnalyzeFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const config = getActiveConfig();
      const result = await analyzeContractFile(file, config);
      setAnalysis(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao auditar o documento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeText = async (text: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const config = getActiveConfig();
      const result = await analyzeContractText(text, config);
      setAnalysis(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao processar o contrato.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExample = (text: string, role: string) => {
    setAiState((prev) => ({ ...prev, user_role: role }));
    handleAnalyzeText(text);
  };

  const handleUpdateActiveProvider = (provider: 'gemini' | 'ollama' | 'openai') => {
    setAiState((prev) => ({ ...prev, activeProvider: provider }));
  };

  const handleUpdateSelectedModel = (model: string) => {
    setAiState((prev) => ({
      ...prev,
      [prev.activeProvider]: {
        ...prev[prev.activeProvider],
        selectedModel: model,
      },
    }));
  };

  const handleUpdateUserRole = (role: string) => {
    setAiState((prev) => ({ ...prev, user_role: role }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Fixo */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExamples={() => setIsExamplesOpen(true)}
        serverOnline={serverOnline}
      />

      {/* Alerta de Erro se houver */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 w-full animate-fade-in">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-900">Não foi possível auditar o contrato:</span>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12">
        {analysis ? (
          <Dashboard
            analysis={analysis}
            onReset={() => {
              setAnalysis(null);
              setErrorMessage(null);
            }}
          />
        ) : (
          <UploadSection
            onAnalyzeFile={handleAnalyzeFile}
            onAnalyzeText={handleAnalyzeText}
            isLoading={isLoading}
            aiState={aiState}
            onUpdateActiveProvider={handleUpdateActiveProvider}
            onUpdateSelectedModel={handleUpdateSelectedModel}
            onUpdateUserRole={handleUpdateUserRole}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-700">
          🐼 Condinome Panda • Desenvolvido por <strong>Daniel Douglas Melo Gomes Neto</strong> & <strong>Lucas Pereira Brito</strong>
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Ferramenta assistiva sem valor de consultoria jurídica formal. Em caso de dúvidas graves, consulte a Defensoria Pública.
        </p>
      </footer>

      {/* Modais */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiState={aiState}
        onSave={(newState) => setAiState(newState)}
      />

      <ExampleContractsModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelectExample={handleSelectExample}
      />
    </div>
  );
};

export default App;
