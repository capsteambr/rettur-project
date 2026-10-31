import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserSession } from '../types/contract';

interface LawyerLoginPageProps {
  onLogin: (session: UserSession) => void;
}

interface DemoLawyerPersona {
  name: string;
  email: string;
  oab: string;
  plan: string;
  specialty: string;
  badge: string;
}

const DEMO_LAWYER_PERSONAS: DemoLawyerPersona[] = [
  {
    name: 'Dra. Amanda Silveira',
    email: 'amanda.silveira@adv.oab.org.br',
    oab: 'OAB/GO 54.321',
    plan: 'Especialista (R$ 149,90/mês)',
    specialty: 'Direito Imobiliário & Urbanístico',
    badge: 'Advogada Solo / Especialista',
  },
  {
    name: 'Dr. Roberto Macedo',
    email: 'roberto@macedoeassociados.adv.br',
    oab: 'OAB/SP 123.456',
    plan: 'Escritório Médio (R$ 349,90/mês)',
    specialty: 'Direito Empresarial & Societário',
    badge: 'Sócio / Casa de Advocacia',
  },
];

export const LawyerLoginPage: React.FC<LawyerLoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>(DEMO_LAWYER_PERSONAS[0].name);
  const [email, setEmail] = useState<string>(DEMO_LAWYER_PERSONAS[0].email);
  const [oab, setOab] = useState<string>(DEMO_LAWYER_PERSONAS[0].oab);
  const [plan, setPlan] = useState<string>(DEMO_LAWYER_PERSONAS[0].plan);

  const handleInstantLogin = (persona: DemoLawyerPersona) => {
    onLogin({
      isLoggedIn: true,
      userType: 'lawyer',
      name: persona.name,
      email: persona.email,
      documentsAnalyzed: 0,
      maxFreeDocuments: 9999,
      oab: persona.oab,
      subscriptionPlan: persona.plan,
    });
    navigate('/advogado/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      isLoggedIn: true,
      userType: 'lawyer',
      name: name.trim() || 'Dr. Advogado',
      email: email.trim() || 'advogado@rettur.com.br',
      documentsAnalyzed: 0,
      maxFreeDocuments: 9999,
      oab: oab.trim() || 'OAB/BR 00.000',
      subscriptionPlan: plan,
    });
    navigate('/advogado/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 hero-grid-pattern relative">
      <div className="max-w-lg w-full bg-card border border-border-custom rounded-2xl p-8 shadow-2xl relative z-10 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent mx-auto flex items-center justify-center text-2xl shadow-sm">
            <i className="fas fa-scale-balanced"></i>
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
            Portal da Advocacia (SaaS B2B)
          </span>
          <h2 className="text-2xl font-black text-primary-text tracking-tight">
            Acesso do Advogado Credenciado
          </h2>
          <p className="text-xs text-secondary-text leading-relaxed">
            Receba leads qualificados com pré-análise documental prévia, gerencie chamados e conecte-se com clientes da sua região.
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
            Clique em uma persona credenciada para entrar no Dashboard imediatamente:
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {DEMO_LAWYER_PERSONAS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInstantLogin(p)}
                className="w-full text-left p-3 rounded-lg bg-card hover:bg-card-hover border border-border-custom hover:border-accent/50 transition flex items-center justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-primary-text group-hover:text-accent transition">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-accent">
                      {p.oab}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-secondary-bg text-secondary-text border border-border-custom">
                      {p.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-secondary-text mt-0.5">
                    <span>{p.specialty}</span>
                    <span>•</span>
                    <span className="font-semibold text-primary-text">{p.plan}</span>
                  </div>
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
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-secondary-text mb-1">
                Nome do Profissional
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dra. Amanda Silveira"
                className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3 py-2 text-xs text-primary-text focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-text mb-1">
                Número da OAB / UF
              </label>
              <input
                type="text"
                required
                value={oab}
                onChange={(e) => setOab(e.target.value)}
                placeholder="Ex: OAB/GO 54.321"
                className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3 py-2 text-xs text-primary-text font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-text mb-1">
              E-mail Profissional
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="advogado@escritorio.adv.br"
              className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3.5 py-2.5 text-xs text-primary-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-text mb-1">
              Plano de Assinatura SaaS
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full bg-secondary-bg border border-border-custom rounded-xl px-3.5 py-2.5 text-xs text-secondary-text focus:outline-none focus:border-accent font-medium"
            >
              <option value="Solo (R$ 79,90/mês)">Plano Solo - R$ 79,90/mês (1 área, 15 contatos)</option>
              <option value="Especialista (R$ 149,90/mês)">Plano Especialista - R$ 149,90/mês (3 áreas, contatos ilimitados)</option>
              <option value="Escritório Médio (R$ 349,90/mês)">Plano Escritório Médio - R$ 349,90/mês (Até 5 advogados)</option>
              <option value="Casa de Advocacia (R$ 799,90/mês)">Casa de Advocacia - R$ 799,90/mês (Full-service ilimitado)</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-secondary-text space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary-text">
              <i className="fas fa-check text-accent text-xs"></i>
              <span>Recursos Exclusivos da Advocacia:</span>
            </div>
            <p>✓ Painel de chamados com clientes interessados da sua região</p>
            <p>✓ Gestão de avaliações e depoimentos com nota média</p>
            <p>✓ Atendimento direto via WhatsApp com contexto pré-analisado</p>
            <p>✓ Total conformidade com Provimento 205/2021 do CFOAB</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-black text-xs transition shadow-lg shadow-accent/15 flex items-center justify-center gap-2"
          >
            <i className="fas fa-arrow-right-to-bracket"></i>
            <span>Acessar Painel do Advogado (Dashboard)</span>
          </button>
        </form>

        <div className="pt-4 border-t border-border-custom text-center">
          <p className="text-xs text-secondary-text">
            Não é advogado?{' '}
            <Link
              to="/cliente/login"
              className="text-accent font-bold hover:underline"
            >
              Acessar Portal do Cliente →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
