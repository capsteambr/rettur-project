import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { LawyersDirectoryPage } from './pages/LawyersDirectoryPage';
import { SecurityTermsPage } from './pages/SecurityTermsPage';
import { ClientLoginPage } from './pages/ClientLoginPage';
import { LawyerLoginPage } from './pages/LawyerLoginPage';
import { LawyerDashboardPage } from './pages/LawyerDashboardPage';
import { PlansPricingPage } from './pages/PlansPricingPage';
import { AuthModal } from './components/AuthModal';
import { ContractAnalysisResponse, UserSession, ConsultationRecord } from './types/contract';
import { analyzeContractFile, analyzeContractText } from './services/api';
import { AlertCircle } from 'lucide-react';

const INITIAL_DEMO_CONSULTATIONS: ConsultationRecord[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 58).toISOString(),
    contractType: 'Locação Residencial Urbana',
    riskScore: 7,
    riskLevel: 'ALTO',
    fileName: 'contrato_aluguel_apartamento_104.pdf',
    analysis: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 58).toISOString(),
      contract_type: 'Locação Residencial Urbana',
      risk_score: 7,
      risk_level: 'ALTO',
      summary_plain_text:
        'Trata-se de contrato padrão de locação residencial com prazo determinado de 30 meses. Identificou-se cláusula de renovação automática compulsória sem notificação prévia de 90 dias, e multa rescisória fixada em 6 meses de aluguel integral, o que é atípico para práticas de mercado (costumeiramente 3 meses proporcionais ao tempo restante).',
      strengths: [
        {
          clause_reference: 'Cláusula 5ª',
          title: 'Responsabilidade por Manutenções Estruturais',
          explanation:
            'O locador assume expressamente o custeio de reparos que comprometam a habitabilidade do imóvel sem repasse de taxas extraordinárias ao inquilino.',
        },
        {
          clause_reference: 'Cláusula 9ª',
          title: 'Índice de Reajuste pelo IPCA',
          explanation:
            'Adoção do IPCA (em vez do IGP-M), trazendo previsibilidade e menor volatilidade aos aumentos anuais.',
        },
      ],
      weaknesses_and_traps: [
        {
          clause_reference: 'Cláusula 12ª',
          title: 'Multa Rescisória Desproporcional',
          severity: 'ALTO',
          original_snippet:
            'A rescisão unilateral por parte do locatário a qualquer tempo implicará no pagamento de multa irredutível correspondente a 6 (seis) meses de aluguel vigentes.',
          plain_explanation:
            'A praxe de mercado e a Lei do Inquilinato preveem multa de até 3 meses aplicada proporcionalmente aos meses restantes.',
          recommendation:
            'Solicite a redução para 3 meses e a inclusão da regra de proporcionalidade (art. 4º da Lei 8.245/91).',
        },
        {
          clause_reference: 'Cláusula 18ª',
          title: 'Renovação Automática com Notificação de 90 Dias',
          severity: 'MEDIO',
          original_snippet:
            'O silêncio do locatário até 90 dias antes do término prorrogará o contrato por igual período com incidência de nova carência rescisória.',
          plain_explanation:
            'Prazo excessivo para aviso prévio de desocupação.',
          recommendation:
            'Alinhe redução para 30 dias de antecedência para comunicação de saída.',
        },
      ],
      timeline: [
        {
          event: 'Reajuste Anual',
          trigger_date_or_period: 'A cada 12 meses',
          metric_or_consequence: 'Correção pelo IPCA',
          alert: 'Fique atento ao aniversário do contrato para conferir o cálculo.',
        },
        {
          event: 'Aviso Prévio para Não Renovação',
          trigger_date_or_period: 'Até 90 dias antes do término',
          metric_or_consequence: 'Renovação compulsória',
          alert: 'Agende alerta no calendário para notificar a imobiliária.',
        },
      ],
      actionable_questions: [
        'A taxa de condomínio discrimina despesas ordinárias das extraordinárias de reforma predial?',
        'O laudo de vistoria inicial com fotos será assinado junto com o contrato?',
      ],
      suggested_practice_areas: ['Direito Imobiliário', 'Direito Civil'],
      ethical_disclaimer:
        'Esta pré-análise possui caráter meramente informativo e de suporte à leitura. Não substitui consulta jurídica formal privativa da advocacia (Lei 8.906/94).',
    },
  },
  {
    id: 'c83b991e-3a17-48f5-9372-d5cb694fa812',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    contractType: 'Prestação de Serviços de TI PJ',
    riskScore: 5,
    riskLevel: 'MEDIO',
    fileName: 'contrato_desenvolvimento_software_pj.pdf',
    analysis: {
      id: 'c83b991e-3a17-48f5-9372-d5cb694fa812',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
      contract_type: 'Prestação de Serviços de TI PJ',
      risk_score: 5,
      risk_level: 'MEDIO',
      summary_plain_text:
        'Contrato B2B de prestação de serviços de tecnologia com escopo fechado e pagamentos por sprints. Há cláusula estrita de confidencialidade e retenção de código até quitação de parcelas.',
      strengths: [
        {
          clause_reference: 'Cláusula 3ª',
          title: 'Pagamento Atrelado a Homologação',
          explanation: 'Pagamentos escalonados por entrega verificada de cada etapa funcional.',
        },
      ],
      weaknesses_and_traps: [
        {
          clause_reference: 'Cláusula 8ª',
          title: 'Prazo Indeterminado de Não-Concorrência',
          severity: 'MEDIO',
          original_snippet: 'O prestador se compromete a não prestar serviços a clientes congêneres por prazo indeterminado.',
          plain_explanation: 'Cláusulas de não-concorrência sem delimitação temporal ou territorial razoável costumam ser desproporcionais.',
          recommendation: 'Fixar limite temporal de até 6 a 12 meses e compensação financeira caso aplicável.',
        },
      ],
      timeline: [
        {
          event: 'Homologação de Sprint',
          trigger_date_or_period: 'Até 5 dias úteis pós-entrega',
          metric_or_consequence: 'Aprovação tácita se não contestado',
        },
      ],
      actionable_questions: ['Haverá custeio de horas extras ou manutenções fora do escopo original?'],
      suggested_practice_areas: ['Direito Empresarial', 'Direito Civil'],
    },
  },
];

const DEFAULT_USER_SESSION: UserSession = {
  isLoggedIn: true,
  userType: 'client',
  name: 'Usuário Demo',
  email: 'usuario@rettur.com.br',
  documentsAnalyzed: 1,
  maxFreeDocuments: 10,
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  // Tema Escuro / Claro
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('rettur_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark', 'dark-theme');
      root.classList.remove('light', 'light-theme');
      localStorage.setItem('rettur_theme', 'dark');
    } else {
      root.classList.add('light', 'light-theme');
      root.classList.remove('dark', 'dark-theme');
      localStorage.setItem('rettur_theme', 'light');
    }
  }, [isDark]);

  // Sessão do Usuário
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('rettur_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userType === 'client') {
          parsed.maxFreeDocuments = 10;
        }
        return parsed;
      } catch {
        return DEFAULT_USER_SESSION;
      }
    }
    return DEFAULT_USER_SESSION;
  });

  useEffect(() => {
    localStorage.setItem('rettur_user_session', JSON.stringify(userSession));
  }, [userSession]);

  const [userRole, setUserRole] = useState<string>('locatario / inquilino');
  const [analysis, setAnalysis] = useState<ContractAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const [consultationsHistory, setConsultationsHistory] = useState<ConsultationRecord[]>(() => {
    const saved = localStorage.getItem('rettur_consultations_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DEMO_CONSULTATIONS;
      }
    }
    return INITIAL_DEMO_CONSULTATIONS;
  });

  useEffect(() => {
    localStorage.setItem('rettur_consultations_history', JSON.stringify(consultationsHistory));
  }, [consultationsHistory]);

  const incrementQuota = () => {
    setUserSession((prev) => ({
      ...prev,
      documentsAnalyzed: prev.documentsAnalyzed + 1,
    }));
  };

  const generateUuid = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'c-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
  };

  const handleAnalyzeFile = async (file: File) => {
    if (userSession.userType === 'client' && userSession.documentsAnalyzed >= userSession.maxFreeDocuments) {
      setErrorMessage(
        `Você atingiu o limite de ${userSession.maxFreeDocuments} consultas gratuitas deste mês. Conecte-se com um advogado no nosso diretório para suporte formal!`
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeContractFile(file, userRole);
      const uuid = result.id || generateUuid();
      const now = new Date();
      const expires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 dias

      result.id = uuid;
      result.created_at = result.created_at || now.toISOString();
      result.expires_at = result.expires_at || expires.toISOString();

      const newRecord: ConsultationRecord = {
        id: uuid,
        createdAt: result.created_at,
        expiresAt: result.expires_at,
        contractType: result.contract_type,
        riskScore: result.risk_score,
        riskLevel: result.risk_level,
        fileName: file.name,
        analysis: result,
      };

      setConsultationsHistory((prev) => [newRecord, ...prev.filter((c) => c.id !== uuid)]);
      setAnalysis(result);
      incrementQuota();
      navigate('/cliente/pre-analise');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao realizar a triagem do documento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeText = async (text: string) => {
    if (userSession.userType === 'client' && userSession.documentsAnalyzed >= userSession.maxFreeDocuments) {
      setErrorMessage(
        `Você atingiu o limite de ${userSession.maxFreeDocuments} consultas gratuitas deste mês. Conecte-se com um advogado no nosso diretório para suporte formal!`
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeContractText(text, userRole);
      const uuid = result.id || generateUuid();
      const now = new Date();
      const expires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      result.id = uuid;
      result.created_at = result.created_at || now.toISOString();
      result.expires_at = result.expires_at || expires.toISOString();

      const newRecord: ConsultationRecord = {
        id: uuid,
        createdAt: result.created_at,
        expiresAt: result.expires_at,
        contractType: result.contract_type,
        riskScore: result.risk_score,
        riskLevel: result.risk_level,
        analysis: result,
      };

      setConsultationsHistory((prev) => [newRecord, ...prev.filter((c) => c.id !== uuid)]);
      setAnalysis(result);
      incrementQuota();
      navigate('/cliente/pre-analise');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro inesperado ao processar o documento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConsultation = (id: string) => {
    setConsultationsHistory((prev) => prev.filter((c) => c.id !== id));
    if (analysis?.id === id) {
      setAnalysis(null);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setErrorMessage(null);
    navigate('/cliente/pre-analise');
  };

  return (
    <div className="min-h-screen flex flex-col bg-main text-primary-text selection:bg-accent/20 selection:text-accent transition-colors duration-200">
      {/* Header com Navegação */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        userSession={userSession}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Alerta de Erro ou Limite */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 w-full animate-fade-in z-30">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-medium flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-700 dark:text-rose-300">Aviso:</span>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Rotas Principais */}
      <main className="flex-1 w-full">
        <Routes>
          {/* Redirecionamentos Iniciais para Portal do Cliente */}
          <Route path="/" element={<Navigate to="/cliente/pre-analise" replace />} />
          <Route path="/cliente" element={<Navigate to="/cliente/pre-analise" replace />} />

          {/* Rotas do Cliente / Cidadão (/cliente/*) */}
          <Route
            path="/cliente/pre-analise"
            element={
              <HomePage
                userRole={userRole}
                onUpdateUserRole={setUserRole}
                onAnalyzeFile={handleAnalyzeFile}
                onAnalyzeText={handleAnalyzeText}
                analysis={analysis}
                isLoading={isLoading}
                onReset={handleReset}
              />
            }
          />
          <Route
            path="/cliente/pre-consulta"
            element={<Navigate to="/cliente/pre-analise" replace />}
          />
          <Route
            path="/cliente/historico"
            element={
              <HistoryPage
                history={consultationsHistory}
                onDeleteConsultation={handleDeleteConsultation}
                onReset={handleReset}
              />
            }
          />
          <Route
            path="/cliente/consulta"
            element={<Navigate to="/cliente/historico" replace />}
          />
          <Route path="/cliente/advogados" element={<LawyersDirectoryPage />} />
          <Route
            path="/cliente/login"
            element={<ClientLoginPage onLogin={(s) => setUserSession(s)} />}
          />

          {/* Rotas do Advogado (/advogado/*) */}
          <Route
            path="/advogado"
            element={
              <LawyerDashboardPage
                session={userSession}
                onLogout={() =>
                  setUserSession({
                    isLoggedIn: false,
                    userType: 'client',
                    name: 'Visitante',
                    email: '',
                    documentsAnalyzed: 0,
                    maxFreeDocuments: 10,
                  })
                }
              />
            }
          />
          <Route
            path="/advogado/dashboard"
            element={
              <LawyerDashboardPage
                session={userSession}
                onLogout={() =>
                  setUserSession({
                    isLoggedIn: false,
                    userType: 'client',
                    name: 'Visitante',
                    email: '',
                    documentsAnalyzed: 0,
                    maxFreeDocuments: 10,
                  })
                }
              />
            }
          />
          <Route
            path="/advogado/login"
            element={<LawyerLoginPage onLogin={(s) => setUserSession(s)} />}
          />

          {/* Planos & Precificação (B2C & B2B) */}
          <Route path="/planos" element={<PlansPricingPage />} />
          <Route path="/cliente/planos" element={<PlansPricingPage />} />
          <Route path="/advogado/planos" element={<PlansPricingPage />} />

          {/* Rotas de Compatibilidade / Legadas */}
          <Route path="/pre-analise" element={<Navigate to="/cliente/pre-analise" replace />} />
          <Route path="/historico" element={<Navigate to="/cliente/historico" replace />} />
          <Route path="/consulta" element={<Navigate to="/cliente/historico" replace />} />
          <Route path="/advogados" element={<Navigate to="/cliente/advogados" replace />} />

          {/* Termos e Segurança */}
          <Route path="/seguranca" element={<SecurityTermsPage />} />
          <Route path="/termos" element={<Navigate to="/seguranca" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/cliente/pre-analise" replace />} />
        </Routes>
      </main>

      {/* Rodapé com Disclaimer Ético Obrigatório & Links */}
      <footer className="border-t border-border-custom bg-card/40 py-6 text-center text-xs text-secondary-text">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <Link to="/cliente/pre-analise" className="text-secondary-text hover:text-accent transition">
              Pré-Análise (Cliente)
            </Link>
            <span>•</span>
            <Link to="/cliente/historico" className="text-secondary-text hover:text-accent transition">
              Histórico de Análises
            </Link>
            <span>•</span>
            <Link to="/cliente/advogados" className="text-secondary-text hover:text-accent transition">
              Diretório OAB
            </Link>
            <span>•</span>
            <Link to="/planos" className="text-secondary-text hover:text-accent transition">
              Planos & Preços
            </Link>
            <span>•</span>
            <Link to="/advogado" className="text-secondary-text hover:text-accent transition">
              Área do Advogado (SaaS)
            </Link>
            <span>•</span>
            <Link to="/seguranca" className="text-secondary-text hover:text-accent transition">
              Segurança & LGPD
            </Link>
          </div>

          <p className="font-semibold text-primary-text flex items-center justify-center gap-1.5">
            <i className="fas fa-scale-balanced text-accent"></i>
            <span>Rettur • Integrantes: <strong>Daniel Douglas Melo Gomes Neto</strong> & <strong>Lucas Pereira Brito</strong></span>
          </p>
          <p className="text-[11px] text-secondary-text/80 leading-relaxed">
            <strong>Aviso de Conformidade (Provimento 205/2021 OAB):</strong> O Rettur é um software de triagem cognitiva preliminar. Suas análises têm caráter meramente informativo e preventivo, não constituindo parecer, consultoria jurídica ou patrocínio processual privativo da advocacia.
          </p>
        </div>
      </footer>

      {/* Modal de Login / Conta */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={userSession}
        onLogin={(s) => setUserSession(s)}
        onLogout={() =>
          setUserSession({
            isLoggedIn: false,
            userType: 'client',
            name: 'Visitante',
            email: '',
            documentsAnalyzed: 0,
            maxFreeDocuments: 10,
          })
        }
      />
    </div>
  );
};

export default App;
