import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserSession } from '../types/contract';

interface ClientLoginPageProps {
  onLogin: (session: UserSession) => void;
}

interface DemoPersona {
  name: string;
  email: string;
  roleDescription: string;
  badge: string;
}

const DEMO_CLIENT_PERSONAS: DemoPersona[] = [
  {
    name: 'Carlos Andrade',
    email: 'carlos.andrade@email.com',
    roleDescription: 'Cidadão / Inquilino Urbano (Locação Residencial)',
    badge: 'Cidadão',
  },
  {
    name: 'Mariana Duarte',
    email: 'mariana.duarte@techsolucoes.com.br',
    roleDescription: 'Sócia Gestora / PME (Prestação de Serviços PJ)',
    badge: 'PME / Empresa',
  },
];

export const ClientLoginPage: React.FC<ClientLoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>(DEMO_CLIENT_PERSONAS[0].name);
  const [email, setEmail] = useState<string>(DEMO_CLIENT_PERSONAS[0].email);

  const handleInstantLogin = (persona: DemoPersona) => {
    onLogin({
      isLoggedIn: true,
      userType: 'client',
      name: persona.name,
      email: persona.email,
      documentsAnalyzed: 1,
      maxFreeDocuments: 10,
      subscriptionPlan: 'Plano Gratuito (10 Consultas/mês)',
    });
    navigate('/cliente/pre-analise');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      isLoggedIn: true,
      userType: 'client',
      name: name.trim() || 'Cliente Rettur',
      email: email.trim() || 'cliente@email.com',
      documentsAnalyzed: 1,
      maxFreeDocuments: 10,
      subscriptionPlan: 'Plano Gratuito (10 Consultas/mês)',
    });
    navigate('/cliente/pre-analise');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 hero-grid-pattern relative">
      <div className="max-w-md w-full bg-card border border-border-custom rounded-2xl p-8 shadow-2xl relative z-10 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent mx-auto flex items-center justify-center text-2xl shadow-sm">
            <i className="fas fa-user"></i>
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Portal do Cliente / Cidadão
          </span>
          <h2 className="text-2xl font-black text-primary-text tracking-tight">
            Acesse sua Conta
          </h2>
          <p className="text-xs text-secondary-text leading-relaxed">
            Tenha acesso a <strong>10 consultas gratuitas mensais</strong>, histórico com descarte programado e conexão direta com advogados credenciados.
          </p>
        </div>

        {/* MODO DEMONSTRAÇÃO / APRESENTAÇÃO INSTANTÂNEA */}
        <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-accent">
            <span className="flex items-center gap-1.5">
              <i className="fas fa-bolt"></i>
              <span>Demonstração Rápida (1 Clique)</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent">
              Banca / Pitch
            </span>
          </div>
          <p className="text-[11px] text-secondary-text">
            Clique para entrar diretamente sem preencher campos:
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {DEMO_CLIENT_PERSONAS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInstantLogin(p)}
                className="w-full text-left p-2.5 rounded-lg bg-card hover:bg-card-hover border border-border-custom hover:border-accent/50 transition flex items-center justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-primary-text group-hover:text-accent transition">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-secondary-bg text-secondary-text border border-border-custom">
                      {p.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-secondary-text block">
                    {p.roleDescription}
                  </span>
                </div>
                <i className="fas fa-arrow-right text-xs text-secondary-text group-hover:text-accent group-hover:translate-x-0.5 transition"></i>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border-custom w-full"></div>
          <span className="bg-card px-3 text-[11px] font-bold text-secondary-text uppercase tracking-wider relative">
            ou acesse com seus dados
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-text mb-1">
              Seu Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Andrade"
              className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3.5 py-2.5 text-xs text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-text mb-1">
              Seu E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: seuemail@exemplo.com"
              className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3.5 py-2.5 text-xs text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-secondary-bg/60 border border-border-custom text-[11px] text-secondary-text space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary-text">
              <i className="fas fa-shield-halved text-accent text-xs"></i>
              <span>Garantias da Conta Cidadão:</span>
            </div>
            <p>✓ 10 pré-análises mensais gratuitas com IA preventiva</p>
            <p>✓ Privacidade garantida pela LGPD (zero retenção)</p>
            <p>✓ Busca irrestrita de advogados verificados da OAB</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition shadow-lg shadow-accent/15 flex items-center justify-center gap-2"
          >
            <i className="fas fa-arrow-right-to-bracket"></i>
            <span>Entrar / Continuar como Cliente</span>
          </button>
        </form>

        <div className="pt-4 border-t border-border-custom text-center">
          <p className="text-xs text-secondary-text">
            É advogado inscrito na OAB?{' '}
            <Link
              to="/advogado/login"
              className="text-accent font-bold hover:underline"
            >
              Acessar Portal do Advogado →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
