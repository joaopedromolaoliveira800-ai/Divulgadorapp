import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Mail,
  Lock,
} from 'lucide-react';
import { User, GoogleAdsStatus } from '../types';

interface SettingsViewProps {
  user: User | null;
  googleAdsStatus: GoogleAdsStatus | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, googleAdsStatus }) => {
  const [notifyCampaigns, setNotifyCampaigns] = useState(true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(true);
  const [notifyLowBudget, setNotifyLowBudget] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Preferências
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Configurações da Conta
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie seu perfil de acesso, notificações e parâmetros do DivulgadorAds.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-lg">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{user?.name || 'Usuário'}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <label className="text-slate-500 block mb-1">Função no Sistema</label>
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Gestor de Tráfego'}
              </span>
            </div>
            <div>
              <label className="text-slate-500 block mb-1">ID do Usuário</label>
              <span className="font-mono text-slate-400">{user?.id || 'usr_default'}</span>
            </div>
          </div>
        </div>

        {/* Developer Token & API Info */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Parâmetros da Google Ads API
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Developer Token do Google</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {googleAdsStatus?.developerToken || 'obopXETQW2Vmfba7OhvGQ'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Oficial
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Status da Autenticação OAuth</span>
                <span className="text-slate-200 font-semibold">
                  {googleAdsStatus?.isConnected
                    ? `Autenticado (${googleAdsStatus.googleEmail || 'Ativo'})`
                    : 'Pendente de conexão'}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  googleAdsStatus?.isConnected ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {googleAdsStatus?.isConnected ? 'Pronto para Publicar' : 'Requer Conexão'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <form onSubmit={handleSave} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Notificações e Avisos
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Status da Campanha</span>
                <span className="text-[11px] text-slate-500">
                  Notificar quando uma campanha for ativada, pausada ou reprovada pelo Google Ads.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyCampaigns}
                onChange={(e) => setNotifyCampaigns(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Relatório Semanal de Desempenho</span>
                <span className="text-[11px] text-slate-500">
                  Resumo semanal com investimento, cliques e conversões consolidadas.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyWeeklyReport}
                onChange={(e) => setNotifyWeeklyReport(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Alerta de Orçamento Crítico</span>
                <span className="text-[11px] text-slate-500">
                  Avisar quando a conta Google Ads estiver próxima do limite diário estipulado.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyLowBudget}
                onChange={(e) => setNotifyLowBudget(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Preferências salvas com sucesso!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
