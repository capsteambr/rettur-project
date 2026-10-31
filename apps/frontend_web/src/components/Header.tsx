import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenExamples: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  serverOnline: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenExamples,
  isDark,
  onToggleTheme,
  serverOnline,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-custom bg-main/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-2xl transition group-hover:scale-110">🐼</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-primary-text flex items-center gap-1.5">
                Condinome Panda
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-accent/15 text-accent border border-accent/20">
                  AI Legal
                </span>
              </span>
              <span className="text-[10px] text-secondary-text hidden sm:inline">
                Auditoria e Simplificação de Contratos
              </span>
            </div>
          </Link>

          {/* Links Internos */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-secondary-text">
            <Link
              to="/api"
              className={`px-3 py-1.5 rounded-lg hover:text-primary-text hover:bg-card transition flex items-center gap-1.5 ${
                currentPath === '/api' ? 'text-accent bg-card font-bold' : ''
              }`}
            >
              <i className="fas fa-book-open text-xs"></i>
              <span>Documentação API</span>
            </Link>
          </nav>
        </div>

        {/* Grupo de Modos Retrô (Pílula Estilo Modelo de Consulta) */}
        <div className="hidden lg:flex items-center gap-1 bg-card border border-border-custom px-2 py-1 rounded-full shadow-inner">
          <Link
            to="/"
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              currentPath === '/'
                ? 'bg-accent text-slate-950 shadow-sm'
                : 'text-secondary-text hover:text-primary-text'
            }`}
            title="Interface Web Padrão"
          >
            <i className="fas fa-file-contract"></i>
            <span>Web Padrão</span>
          </Link>

          <Link
            to="/terminal"
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              currentPath === '/terminal' || currentPath === '/linux'
                ? 'bg-accent text-slate-950 shadow-sm'
                : 'text-secondary-text hover:text-primary-text'
            }`}
            title="Terminal Retrô Linux"
          >
            <i className="fab fa-linux"></i>
            <span>Terminal Linux</span>
          </Link>

          <Link
            to="/windows"
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              currentPath === '/windows'
                ? 'bg-accent text-slate-950 shadow-sm'
                : 'text-secondary-text hover:text-primary-text'
            }`}
            title="Windows 98 Desktop"
          >
            <i className="fab fa-windows"></i>
            <span>Windows 98</span>
          </Link>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status do Backend */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-card border border-border-custom text-secondary-text">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : serverOnline === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            {serverOnline === true ? 'API Online' : serverOnline === false ? 'API Offline' : 'Checando...'}
          </div>

          {/* Exemplos Rápidos */}
          <button
            onClick={onOpenExamples}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text bg-card hover:bg-card-hover border border-border-custom transition shadow-sm"
            title="Carregar contrato de exemplo"
          >
            <i className="fas fa-wand-magic-sparkles text-amber-400 text-xs"></i>
            <span className="hidden sm:inline">Exemplos</span>
          </button>

          {/* Configurações de IA */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text bg-card hover:bg-card-hover border border-border-custom transition shadow-sm"
            title="Configurar Chaves e Modelos de IA"
          >
            <i className="fas fa-gear text-xs"></i>
            <span className="hidden sm:inline">Configurar IA</span>
          </button>

          {/* Alternador de Tema Claro / Escuro */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary-text hover:text-primary-text bg-card hover:bg-card-hover border border-border-custom transition"
            title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            aria-label="Trocar tema"
          >
            {isDark ? (
              <i className="fas fa-sun text-amber-400 text-sm"></i>
            ) : (
              <i className="fas fa-moon text-slate-700 text-sm"></i>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
