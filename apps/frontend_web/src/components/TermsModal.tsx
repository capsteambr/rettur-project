import React from 'react';
import { Link } from 'react-router-dom';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border-custom w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between bg-secondary-bg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <i className="fas fa-shield-halved text-base"></i>
            </div>
            <div>
              <h3 className="font-bold text-base text-primary-text">
                Termos de Uso, IA & Privacidade (LGPD)
              </h3>
              <p className="text-xs text-secondary-text">
                Rettur — Diretrizes éticas, conformidade legal e tratamento de dados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-card-hover transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-secondary-text leading-relaxed">
          {/* Card de Alerta Importante */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex gap-3">
            <i className="fas fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
            <div>
              <p className="font-bold mb-1">Aviso Crítico sobre Inteligência Artificial:</p>
              <p>
                Os relatórios do Rettur são gerados por modelos de inteligência artificial para apoio preliminar à leitura.
                Eles <strong>não constituem parecer jurídico formal</strong>, <strong>não possuem validade probatória</strong> e{' '}
                <strong>não substituem a consulta com um advogado habilitado</strong> (Lei Federal 8.906/94 e Provimento 205/2021 da OAB).
              </p>
            </div>
          </div>

          {/* Seção 1: Natureza do Serviço */}
          <div>
            <h4 className="font-bold text-primary-text text-sm mb-1.5 flex items-center gap-2">
              <i className="fas fa-robot text-accent text-xs"></i>
              1. Natureza da Plataforma e Limitações da IA
            </h4>
            <p>
              O Rettur é uma solução de tecnologia que realiza triagem e sumarização em linguagem acessível de documentos contratuais.
              Por utilizar modelos probabilísticos de Inteligência Artificial:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Caráter meramente informativo:</strong> Os apontamentos de risco, prazos e alertas não afirmam nulidade
                nem tipificam condutas como ilícitas ou criminosas em definitivo.
              </li>
              <li>
                <strong>Necessidade de validação humana:</strong> Nenhuma rescisão, assinatura ou medida financeira deve ser tomada
                baseando-se unicamente nas conclusões geradas pelo sistema.
              </li>
            </ul>
          </div>

          {/* Seção 2: LGPD e Privacidade */}
          <div>
            <h4 className="font-bold text-primary-text text-sm mb-1.5 flex items-center gap-2">
              <i className="fas fa-user-shield text-accent text-xs"></i>
              2. Privacidade e Conformidade com a LGPD (Lei nº 13.709/2018)
            </h4>
            <p>
              Nossa arquitetura foi desenhada sob os princípios de <em>Privacy by Design</em> e minimização de dados:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-main border border-border-custom">
                <span className="font-semibold text-primary-text text-xs block mb-1">
                  ⚡ Processamento 100% Volátil
                </span>
                <span className="text-xs">
                  Os contratos e arquivos enviados são processados apenas na memória volátil (RAM) durante a análise e descartados em seguida.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-main border border-border-custom">
                <span className="font-semibold text-primary-text text-xs block mb-1">
                  🔒 Zero Retenção Permanente
                </span>
                <span className="text-xs">
                  Não salvamos cláusulas contratuais, dados sensíveis ou informações pessoais em banco de dados fixo.
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs">
              Os dados não são comercializados nem utilizados para treinar modelos de inteligência artificial de terceiros.
            </p>
          </div>

          {/* Seção 3: Conexão com Advogados */}
          <div>
            <h4 className="font-bold text-primary-text text-sm mb-1.5 flex items-center gap-2">
              <i className="fas fa-scale-balanced text-accent text-xs"></i>
              3. Conexão Ética com a Advocacia (Estatuto da OAB)
            </h4>
            <p>
              A plataforma valoriza e incentiva a contratação de profissionais da advocacia para análise pormenorizada de cada caso.
              Ao identificar áreas do direito pertinentes ao documento, o Rettur facilita o encaminhamento ao profissional
              devidamente inscrito na Ordem dos Advogados do Brasil (OAB).
            </p>
          </div>

          {/* Link para Página Completa de Segurança e Contingência */}
          <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <i className="fas fa-shield-halved text-accent text-sm"></i>
              <span className="text-xs font-semibold text-primary-text">
                Quer saber sobre defesa contra Prompt Injection e Plano de Contingência?
              </span>
            </div>
            <Link
              to="/seguranca"
              onClick={onClose}
              className="text-xs text-accent font-bold hover:underline shrink-0 ml-2"
            >
              Ver Detalhes →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-custom bg-secondary-bg flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-secondary-text">
            Ao utilizar a ferramenta, você declara estar ciente e de acordo com estes termos.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text border border-border-custom hover:bg-card-hover transition w-full sm:w-auto"
            >
              Fechar
            </button>
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-accent hover:bg-accent-hover text-slate-950 transition shadow-sm w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-check"></i>
                <span>Aceitar e Continuar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
