import React from 'react';
import { X, Sparkles, Building2, Briefcase } from 'lucide-react';

interface ExampleContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (text: string, role: string) => void;
}

export const ExampleContractsModal: React.FC<ExampleContractsModalProps> = ({
  isOpen,
  onClose,
  onSelectExample,
}) => {
  if (!isOpen) return null;

  const examples = [
    {
      id: 'aluguel',
      title: 'Contrato de Aluguel Residencial (Com Armadilhas)',
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
      description: 'Contém renovação automática oculta, multa de 6 meses de rescisão e índice IGP-M acumulado.',
      role: 'locatario / inquilino',
      text: `CONTRATO DE LOCAÇÃO RESIDENCIAL DE IMÓVEL URBANO
LOCADOR: Imobiliária Aliança Ltda.
LOCATÁRIO: Cidadão Leigo da Silva.

CLÁUSULA 1ª - DO OBJETO:
O LOCADOR dá em locação ao LOCATÁRIO o imóvel residencial situado na Rua das Palmeiras, 100, Goiânia-GO.

CLÁUSULA 2ª - DO VALOR E REAJUSTE:
O aluguel mensal é fixado em R$ 1.800,00 (mil e oitocentos reais), vencendo todo dia 05 de cada mês. O reajuste será anual calculado pela variação acumulada do IGP-M (FGV), vedada qualquer redução em caso de deflação.

CLÁUSULA 3ª - DAS REFORMAS E ESTRUTURA:
Toda e qualquer obra, inclusive rachaduras, vazamentos estruturais na laje ou defeitos hidráulicos ocultos, correrão por conta exclusiva e antecipada do LOCATÁRIO, sem direito a retenção ou indenização.

CLÁUSULA 4ª - DA RESCISÃO E MULTA:
Caso o LOCATÁRIO rescinda o presente contrato antes do prazo determinado de 30 meses, incorrerá em multa rescisória compensatória integral e irrevogável no valor de 6 (seis) aluguéis vigentes, independentemente do tempo decorrido.

CLÁUSULA 5ª - DA PRORROGAÇÃO COMPULSÓRIA:
O silêncio do LOCATÁRIO até 90 dias antes do termo final implicará na renovação automática e obrigatória deste instrumento por novo período de 30 meses, sob pena de incidência imediata da multa rescisória da Cláusula 4ª.

CLÁUSULA 6ª - DO FORO:
Fica eleito com exclusividade o foro da Comarca de Macapá-AP para dirimir quaisquer dúvidas oriundas deste contrato, renunciando as partes a qualquer outro.`
    },
    {
      id: 'pj_servicos',
      title: 'Contrato de Prestação de Serviços PJ (Falso PJ)',
      icon: <Briefcase className="w-5 h-5 text-purple-600" />,
      description: 'Exige exclusividade total, horário de ponto rígido e subordinação direta sem nenhum benefício CLT.',
      role: 'prestador de servicos / PJ / MEI',
      text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS AUTÔNOMOS
CONTRATANTE: Tech Global Corp.
CONTRATADA: João Desenvolvedor MEI.

CLÁUSULA PRIMEIRA - DO OBJETO E DEDICAÇÃO:
A CONTRATADA prestará serviços de desenvolvimento de software em regime de dedicação e exclusividade total, sendo terminantemente proibida de prestar serviços a quaisquer terceiros ou projetos pessoais.

CLÁUSULA SEGUNDA - DA JORNADA E SUBORDINAÇÃO:
O titular da CONTRATADA deverá cumprir jornada obrigatória ininterrupta de 44 horas semanais, com controle biométrico de ponto das 09h às 18h, subordinando-se hierarquicamente às ordens do Diretor de Operações.

CLÁUSULA TERCEIRA - DA REMUNERAÇÃO:
A CONTRATADA receberá o valor fixo de R$ 3.500,00 mensais, não fazendo jus a férias, 13º salário, FGTS, repouso semanal remunerado ou hora extra.

CLÁUSULA QUARTA - DA NÃO-CONCORRÊNCIA E MULTA:
Após o encerramento do contrato, o profissional fica impedido de trabalhar para qualquer empresa de tecnologia na América Latina pelo período de 36 meses, sob pena de multa de R$ 100.000,00.`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Contratos de Exemplo para Demonstração
              </h3>
              <p className="text-xs text-slate-500">
                Selecione um caso real para testar a auditoria em segundos no pitch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {examples.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                onSelectExample(ex.text, ex.role);
                onClose();
              }}
              className="p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition flex items-start gap-4 group"
            >
              <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-white border border-slate-200 shrink-0">
                {ex.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900">
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {ex.description}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    Papel: {ex.role}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold group-hover:text-emerald-600">
                    Carregar no formulário →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
