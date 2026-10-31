import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { TerminalPage } from './pages/TerminalPage';
import { WindowsPage } from './pages/WindowsPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
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
  const navigate = useNavigate();

  // Estado do Tema (Dark vs Light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('panda_theme');
    if (saved) return saved === 'dark';
    return true; // Padrão: dark theme estilo OpenCNPJ/Linear
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      localStorage.setItem('panda_theme', 'dark');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      localStorage.setItem('panda_theme', 'light');
    }
  }, [isDark]);

  // Estado de IA
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
    navigate('/');
    handleAnalyzeText(text);
  };

  return (
    <div className="min-h-screen flex flex-col bg-main text-primary-text selection:bg-accent/20 selection:text-accent transition-colors duration-200">
      {/* Header com Navegação e Modos */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExamples={() => setIsExamplesOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        serverOnline={serverOnline}
      />

      {/* Alerta de Erro */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 w-full animate-fade-in z-30">
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-300">Falha na auditoria:</span>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Rotas */}
      <main className="flex-1 w-full">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                aiState={aiState}
                onUpdateActiveProvider={(p) => setAiState((prev) => ({ ...prev, activeProvider: p }))}
                onUpdateSelectedModel={(m) =>
                  setAiState((prev) => ({
                    ...prev,
                    [prev.activeProvider]: {
                      ...prev[prev.activeProvider],
                      selectedModel: m,
                    },
                  }))
                }
                onUpdateUserRole={(r) => setAiState((prev) => ({ ...prev, user_role: r }))}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onAnalyzeFile={handleAnalyzeFile}
                onAnalyzeText={handleAnalyzeText}
                analysis={analysis}
                isLoading={isLoading}
                onReset={() => {
                  setAnalysis(null);
                  setErrorMessage(null);
                }}
              />
            }
          />
          <Route path="/terminal" element={<TerminalPage aiState={aiState} />} />
          <Route path="/linux" element={<TerminalPage aiState={aiState} />} />
          <Route path="/windows" element={<WindowsPage aiState={aiState} />} />
          <Route path="/api" element={<ApiDocsPage />} />
          <Route path="/docs" element={<ApiDocsPage />} />
        </Routes>
      </main>

      {/* Rodapé Institucional Minimalista */}
      <footer className="border-t border-border-custom bg-card/40 py-6 text-center text-xs text-secondary-text">
        <p className="font-semibold text-primary-text">
          🐼 Condinome Panda • Integrantes: <strong>Daniel Douglas Melo Gomes Neto</strong> & <strong>Lucas Pereira Brito</strong>
        </p>
        <p className="mt-1 text-[11px] text-secondary-text/80">
          Ferramenta assistiva sem valor de consultoria formal. Criado para democratizar o acesso à justiça no Hackathon.
        </p>
      </footer>

      {/* Modais Globais */}
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
