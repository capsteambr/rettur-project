import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserSession } from '../types/contract';

interface HeaderProps {
  onOpenAuth: () => void;
  userSession: UserSession;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  userSession,
  isDark,
  onToggleTheme,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isLawyerPortal = currentPath.startsWith('/advogado');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-custom bg-main/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Nome e Título da Plataforma */}
        <Link
          to={isLawyerPortal ? '/advogado' : '/cliente/pre-analise'}
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center text-lg transition group-hover:scale-105 shadow-sm">
            <i className="fas fa-scale-balanced"></i>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-primary-text">
                Rettur
              </span>
              {isLawyerPortal && (
                <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-black uppercase tracking-wider border border-accent/30">
                  Advocacia
                </span>
              )}
            </div>
            <span className="text-[10px] text-secondary-text hidden sm:inline">
              {isLawyerPortal ? 'Painel SaaS do Advogado' : 'Triagem Inteligente de Contratos'}
            </span>
          </div>
        </Link>

        {/* Lado Direito: Navegação Contextual + Limite + Tema */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Menu de Navegação */}
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-secondary-text">
            {isLawyerPortal ? (
              <>
                {/* Links do Portal do Advogado */}
                <Link
                  to="/advogado"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition flex items-center gap-1.5 ${
                    currentPath === '/advogado' || currentPath === '/advogado/dashboard'
                      ? 'text-accent bg-card font-bold border border-border-custom shadow-xs'
                      : ''
                  }`}
                >
                  <i className="fas fa-chart-line text-xs"></i>
                  <span>Painel & Chamados</span>
                </Link>

                <Link
                  to="/advogado/planos"
                  className={`hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition items-center gap-1.5 ${
                    currentPath === '/advogado/planos' || currentPath === '/planos'
                      ? 'text-accent bg-card font-bold border border-border-custom shadow-xs'
                      : ''
                  }`}
                >
                  <i className="fas fa-coins text-xs"></i>
                  <span>Planos SaaS</span>
                </Link>

                <div className="h-4 w-px bg-border-custom/60 hidden sm:block mx-0.5"></div>

                <Link
                  to="/cliente/pre-analise"
                  className="px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-card border border-border-custom/50 hover:border-border-custom transition flex items-center gap-1.5 text-xs font-medium"
                  title="Ir para Área do Cliente"
                >
                  <i className="fas fa-arrow-left text-[10px] text-secondary-text/70"></i>
                  <span>Área do Cliente</span>
                </Link>
              </>
            ) : (
              <>
                {/* Links do Portal do Cliente */}
                <Link
                  to="/cliente/pre-analise"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition flex items-center gap-1.5 ${
                    currentPath === '/' ||
                    currentPath === '/pre-analise' ||
                    currentPath === '/cliente' ||
                    currentPath.startsWith('/cliente/pre-')
                      ? 'text-accent bg-card font-bold border border-border-custom shadow-xs'
                      : ''
                  }`}
                >
                  <i className="fas fa-file-contract text-xs"></i>
                  <span>Pré-Análise</span>
                </Link>

                <Link
                  to="/cliente/historico"
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition flex items-center gap-1.5 ${
                    currentPath.startsWith('/cliente/historico') ||
                    currentPath.startsWith('/cliente/consulta') ||
                    currentPath === '/historico' ||
                    currentPath === '/consulta'
                      ? 'text-accent bg-card font-bold border border-border-custom shadow-xs'
                      : ''
                  }`}
                >
                  <i className="fas fa-clock-rotate-left text-xs"></i>
                  <span>Histórico</span>
                </Link>

                <Link
                  to="/cliente/advogados"
                  className={`hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition items-center gap-1.5 ${
                    currentPath.startsWith('/cliente/advogados') || currentPath === '/advogados'
                      ? 'text-accent bg-card font-bold border border-border-custom shadow-xs'
                      : ''
                  }`}
                >
                  <i className="fas fa-scale-balanced text-xs"></i>
                  <span>Advogados</span>
                </Link>

                <Link
                  to="/planos"
                  className={`hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition items-center gap-1.5 ${
                    currentPath === '/planos' || currentPath === '/cliente/planos'
                      ? 'text-accent bg-card font-bold border border-border-custom shadow-xs'
                      : ''
                  }`}
                >
                  <i className="fas fa-coins text-xs"></i>
                  <span>Planos</span>
                </Link>

                <Link
                  to="/seguranca"
                  className={`hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition items-center gap-1.5 ${
                    currentPath === '/seguranca' || currentPath === '/termos'
                      ? 'text-accent bg-card font-bold border border-border-custom shadow-xs'
                      : ''
                  }`}
                >
                  <i className="fas fa-shield-halved text-xs"></i>
                  <span>Segurança</span>
                </Link>

                <div className="h-4 w-px bg-border-custom/60 hidden sm:block mx-0.5"></div>

                <Link
                  to="/advogado"
                  className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-card border border-border-custom/50 hover:border-border-custom transition items-center gap-1.5 text-xs font-medium"
                  title="Ir para Área do Advogado"
                >
                  <i className="fas fa-scale-balanced text-[11px] text-accent/70"></i>
                  <span>Área do Advogado</span>
                </Link>
              </>
            )}
          </nav>

          {/* Botão de Conta / Limite de Consultas */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border shrink-0 ${
              userSession.isLoggedIn
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-card hover:bg-card-hover border-border-custom text-primary-text'
            }`}
          >
            <i
              className={`text-sm ${
                userSession.isLoggedIn && userSession.userType === 'client'
                  ? 'fas fa-chart-pie'
                  : 'fas fa-user-circle'
              }`}
            ></i>
            <span>
              {userSession.isLoggedIn
                ? userSession.userType === 'client'
                  ? `${userSession.documentsAnalyzed}/${userSession.maxFreeDocuments}`
                  : `${userSession.name.split(' ')[0]} (OAB)`
                : 'Entrar'}
            </span>
          </button>

          {/* Alternador de Tema Claro / Escuro */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary-text hover:text-primary-text bg-card hover:bg-card-hover border border-border-custom transition shrink-0"
            title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            aria-label="Trocar tema"
          >
            {isDark ? (
              <i className="fas fa-sun text-amber-400 text-sm"></i>
            ) : (
              <i className="fas fa-moon text-primary-text text-sm"></i>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
