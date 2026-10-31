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
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    MEDIO: {
      label: 'Risco Médio (Atenção)',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30',
      icon: <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    ALTO: {
      label: 'Risco Alto (Perigo)',
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-500/30',
      icon: <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
    },
    CRITICO: {
      label: 'Risco Crítico (Abusivo)',
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/30',
      icon: <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
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
        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-secondary-bg text-primary-text border border-border-custom text-[11px]">
          {score}/10
        </span>
      )}
    </span>
  );
};
