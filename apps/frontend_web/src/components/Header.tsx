import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenExamples: () => void;
  serverOnline: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenExamples,
  serverOnline,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-sm">
            🐼
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Condinome Panda</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Linguagem Simples
              </span>
            </div>
            <p className="text-xs text-slate-500">Auditoria inteligente para quem não tem advogado</p>
          </div>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-3">
          {/* Status do Backend */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline === true
                  ? 'bg-emerald-500 ring-2 ring-emerald-200'
                  : serverOnline === false
                  ? 'bg-rose-500 ring-2 ring-rose-200'
                  : 'bg-amber-400'
              }`}
            />
            {serverOnline === true ? 'Backend Conectado' : serverOnline === false ? 'Backend Offline' : 'Verificando...'}
          </div>

          {/* Botão de Exemplos para Hackathon */}
          <button
            onClick={onOpenExamples}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
            title="Usar contrato pré-carregado para demonstração rápida"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Exemplos Rápidos</span>
          </button>

          {/* Botão de Configurações de IA */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
            title="Configurar provedor de IA (Ollama Local ou Nuvem)"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Configurar IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
