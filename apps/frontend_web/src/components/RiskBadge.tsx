import React from 'react';
import { RiskLevel } from '../types/contract';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showIcon = true }) => {
  const configs: Record<
    RiskLevel,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    BAIXO: {
      label: 'Risco Baixo (Seguro)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
    },
    MEDIO: {
      label: 'Risco Médio (Atenção)',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Info className="w-4 h-4 text-amber-600" />,
    },
    ALTO: {
      label: 'Risco Alto (Perigo)',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
    },
    CRITICO: {
      label: 'Risco Crítico (Abusivo)',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <AlertOctagon className="w-4 h-4 text-rose-600" />,
    },
  };

  const current = configs[level] || configs.MEDIO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${current.bg} ${current.text} ${current.border}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/70 text-slate-800 text-[11px]">
          {score}/10
        </span>
      )}
    </span>
  );
};
