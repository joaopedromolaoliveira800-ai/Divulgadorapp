import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { Plan, Subscription } from '../types';

interface PlansViewProps {
  currentSubscription?: Subscription | null;
  onRefreshUser: () => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ currentSubscription, onRefreshUser }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [changingSlug, setChangingSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.getPlans();
        setPlans(res.plans || []);
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = async (planSlug: 'free' | 'pro' | 'agency') => {
    setChangingSlug(planSlug);
    try {
      await api.changeSubscription(planSlug);
      onRefreshUser();
      alert(`Plano alterado para ${planSlug.toUpperCase()} com sucesso!`);
    } catch (err: any) {
      alert(`Erro ao alterar plano: ${err.message}`);
    } finally {
      setChangingSlug(null);
    }
  };

  const currentSlug = currentSubscription?.plan?.slug || 'free';

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Assinatura & Recursos
        </span>
        <h1 className="text-3xl font-black text-white mt-1">
          Planos do DivulgadorAds
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Escolha o plano ideal para a escala das suas campanhas no Google Ads.
        </p>

        {/* Clear Financial Disclaimer */}
        <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Importante:</strong> A assinatura do DivulgadorAds refere-se ao acesso à plataforma e ferramentas de IA. O dinheiro destinado à veiculação de anúncios continua sendo administrado e pago diretamente à sua conta Google Ads.
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((p) => {
          const isCurrent = p.slug === currentSlug;
          const isPro = p.slug === 'pro';

          return (
            <div
              key={p.id}
              className={`p-6 rounded-2xl bg-slate-900 border flex flex-col justify-between relative transition-all ${
                isCurrent
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : isPro
                  ? 'border-cyan-500 shadow-xl shadow-cyan-500/10'
                  : 'border-slate-800'
              }`}
            >
              {isPro && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wide">
                  Mais Escolhido
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase tracking-wide">
                  Plano Atual
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {p.slug === 'free' ? 'Básico' : p.slug === 'pro' ? 'Profissional' : 'Escala'}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">{p.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    R$ {p.priceMonthly.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {p.description}
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isCurrent || changingSlug === p.slug}
                  onClick={() => handleSelectPlan(p.slug)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : isPro
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {changingSlug === p.slug ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    'Plano Ativo'
                  ) : (
                    `Migrar para ${p.name}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
