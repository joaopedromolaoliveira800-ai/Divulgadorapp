import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  PlusCircle,
  Play,
  Pause,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Campaign, GoogleAdsStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface CampaignsListViewProps {
  googleAdsStatus: GoogleAdsStatus | null;
  onNavigate: (view: string, data?: any) => void;
}

export const CampaignsListView: React.FC<CampaignsListViewProps> = ({
  googleAdsStatus,
  onNavigate,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [googleAdsStatus?.selectedAccount?.id]);

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    setActionLoadingId(campaignId);
    try {
      const nextStatus = currentStatus === 'ENABLED' ? 'PAUSED' : 'ENABLED';
      await api.updateCampaignStatus(campaignId, nextStatus);
      await loadCampaigns();
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.targetUrl.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Gerenciamento
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Campanhas Google Ads
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle suas campanhas oficiais no Google com pausa e ativação imediata.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCampaigns}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('new-campaign')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar por nome ou URL..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ENABLED">Somente Ativas</option>
            <option value="PAUSED">Somente Pausadas</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Campanha</th>
                  <th className="px-4 py-3.5">Status Google</th>
                  <th className="px-4 py-3.5">Orçamento Diário</th>
                  <th className="px-4 py-3.5">Localização</th>
                  <th className="px-4 py-3.5">ID Google Ads</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-200 text-sm">{c.name}</div>
                      <a
                        href={c.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate max-w-xs">{c.targetUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-200">
                      R$ {Number(c.budget?.dailyAmount || 20).toFixed(2)}/dia
                    </td>
                    <td className="px-4 py-4 text-slate-300 truncate max-w-[140px]">
                      {c.locationTarget || 'Brasil'}
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-slate-400">
                      {c.googleCampaignId || 'Pendente'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={actionLoadingId === c.id}
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            c.status === 'ENABLED'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {c.status === 'ENABLED' ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Ativar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => onNavigate('campaign-detail', { campaignId: c.id })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Detalhes da Campanha"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">Nenhuma campanha encontrada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Crie sua campanha com o criador guiado e publique diretamente na Google Ads API.
            </p>
            <button
              onClick={() => onNavigate('new-campaign')}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
            >
              Criar Nova Campanha
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
