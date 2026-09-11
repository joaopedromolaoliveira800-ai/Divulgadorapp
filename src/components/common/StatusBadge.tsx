import React from 'react';
import { Play, Pause, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  isTestAccount?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isTestAccount, size = 'sm' }) => {
  const upper = status?.toUpperCase() || 'UNKNOWN';

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (isTestAccount) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        Conta de Teste
      </span>
    );
  }

  if (upper === 'ENABLED' || upper === 'ACTIVE' || upper === 'CONNECTED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Ativa
      </span>
    );
  }

  if (upper === 'PAUSED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}>
        <Pause className="w-3 h-3" />
        Pausada
      </span>
    );
  }

  if (upper === 'REMOVED' || upper === 'CANCELED' || upper === 'SUSPENDED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}>
        <ShieldAlert className="w-3.5 h-3.5" />
        Removida
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {status}
    </span>
  );
};
