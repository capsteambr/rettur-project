import React, { useState } from 'react';
import { UserSession } from '../types/contract';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onLogin,
  onLogout,
}) => {
  const [userType, setUserType] = useState<'client' | 'lawyer'>('client');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [oab, setOab] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Especialista (R$ 129,90/mês)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      isLoggedIn: true,
      userType,
      name: name || (userType === 'client' ? 'Usuário' : 'Dr. Usuário'),
      email: email || 'usuario@exemplo.com',
      documentsAnalyzed: 1,
      maxFreeDocuments: userType === 'client' ? 10 : 999,
      oab: userType === 'lawyer' ? oab || 'OAB/GO 12.345' : undefined,
      subscriptionPlan: userType === 'lawyer' ? selectedPlan : 'Plano Gratuito (10 Consultas/mês)',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border-custom rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Topo */}
        <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl text-accent"><i className="fas fa-scale-balanced"></i></span>
            <h3 className="font-extrabold text-primary-text text-base">
              {session.isLoggedIn ? 'Sua Conta Rettur' : 'Acesse ou Cadastre-se'}
            </h3>
          </div>
          <button onClick={onClose} className="text-secondary-text hover:text-primary-text">
            <i className="fas fa-xmark text-lg"></i>
          </button>
        </div>

        {session.isLoggedIn ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-secondary-bg border border-border-custom rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary-text text-sm">{session.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold uppercase text-[10px]">
                  {session.userType === 'lawyer' ? 'Advogado Credenciado' : 'Cliente'}
                </span>
              </div>
              <p className="text-secondary-text">{session.email}</p>
              {session.oab && <p className="font-mono text-primary-text font-bold">{session.oab}</p>}

              {session.userType === 'client' ? (
                <div className="mt-3 pt-3 border-t border-border-custom">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-secondary-text">Limite de Consultas Mensais:</span>
                    <span className="text-accent">{session.documentsAnalyzed} / {session.maxFreeDocuments} consultas</span>
                  </div>
                  <div className="w-full bg-border-custom h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${(session.documentsAnalyzed / session.maxFreeDocuments) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-secondary-text">
                  <span>Plano Ativo: </span>
                  <strong className="text-primary-text">{session.subscriptionPlan}</strong>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold"
            >
              Encerrar Sessão
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Atalhos Rápidos de Demonstração / Pitch */}
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/25 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-accent">
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-bolt"></i>
                  <span>Entrar com 1 Clique (Demonstração):</span>
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-accent/20 text-accent">
                  Banca
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onLogin({
                      isLoggedIn: true,
                      userType: 'client',
                      name: 'Carlos Andrade',
                      email: 'carlos.andrade@email.com',
                      documentsAnalyzed: 1,
                      maxFreeDocuments: 10,
                      subscriptionPlan: 'Plano Gratuito (10 Consultas/mês)',
                    });
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-card hover:bg-card-hover border border-border-custom hover:border-accent text-left transition"
                >
                  <span className="block font-bold text-primary-text text-[11px]">👤 Carlos Andrade</span>
                  <span className="text-[10px] text-secondary-text">Cliente (10 consultas)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLogin({
                      isLoggedIn: true,
                      userType: 'lawyer',
                      name: 'Dra. Amanda Silveira',
                      email: 'amanda.silveira@adv.oab.org.br',
                      documentsAnalyzed: 0,
                      maxFreeDocuments: 9999,
                      oab: 'OAB/GO 54.321',
                      subscriptionPlan: 'Especialista (R$ 149,90/mês)',
                    });
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-card hover:bg-card-hover border border-border-custom hover:border-accent text-left transition"
                >
                  <span className="block font-bold text-primary-text text-[11px]">⚖️ Dra. Amanda</span>
                  <span className="text-[10px] text-accent font-mono">OAB/GO 54.321</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border-custom w-full"></div>
              <span className="bg-card px-2 text-[10px] font-bold text-secondary-text uppercase tracking-wider relative">
                ou preencher formulário
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Seletor de Tipo de Perfil */}
            <div>
              <label className="block font-bold text-secondary-text uppercase text-[10px] mb-2">
                Como você deseja acessar a plataforma?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className={`p-3 rounded-xl border text-center transition ${
                    userType === 'client'
                      ? 'border-accent bg-accent/15 text-primary-text font-bold'
                      : 'border-border-custom hover:border-secondary-text text-secondary-text'
                  }`}
                >
                  <span className="text-lg block mb-1">👤</span>
                  <span>Sou Cliente</span>
                  <span className="block text-[10px] text-secondary-text mt-0.5 font-normal">
                    10 consultas grátis/mês
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('lawyer')}
                  className={`p-3 rounded-xl border text-center transition ${
                    userType === 'lawyer'
                      ? 'border-accent bg-accent/15 text-primary-text font-bold'
                      : 'border-border-custom hover:border-secondary-text text-secondary-text'
                  }`}
                >
                  <span className="text-lg block mb-1">⚖️</span>
                  <span>Sou Advogado</span>
                  <span className="block text-[10px] text-secondary-text mt-0.5 font-normal">
                    SaaS de Leads OAB
                  </span>
                </button>
              </div>
            </div>

            {/* Campos comuns */}
            <div>
              <label className="block font-bold text-secondary-text mb-1">Seu Nome:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={userType === 'client' ? 'João da Silva' : 'Dra. Ana Paula'}
                className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-bold text-secondary-text mb-1">E-mail:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent"
              />
            </div>

            {userType === 'lawyer' && (
              <>
                <div>
                  <label className="block font-bold text-secondary-text mb-1">Número de Registro na OAB:</label>
                  <input
                    type="text"
                    required
                    value={oab}
                    onChange={(e) => setOab(e.target.value)}
                    placeholder="Ex: OAB/GO 55.443"
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-secondary-text mb-1">Plano SaaS Desejado:</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full bg-secondary-bg border border-border-custom rounded-xl p-2.5 text-primary-text focus:outline-none focus:border-accent font-medium"
                  >
                    <option value="Básico (R$ 69,90/mês)">Plano Básico - R$ 69,90/mês</option>
                    <option value="Especialista (R$ 129,90/mês)">Plano Especialista - R$ 129,90/mês (Mais Popular)</option>
                    <option value="Escritório (R$ 299,90/mês)">Plano Escritório - R$ 299,90/mês</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition shadow-lg shadow-accent/15"
            >
              {userType === 'client' ? 'Entrar / Criar Conta Gratuita' : 'Acessar Painel do Advogado (SaaS)'}
            </button>
          </form>
        </div>
      )}
      </div>
    </div>
  );
};
