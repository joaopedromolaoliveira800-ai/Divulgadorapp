import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  MousePointerClick,
  Eye,
  Percent,
  Coins,
  Target,
  BadgePercent,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  Play,
  Pause,
  ArrowUpRight,
  Sparkles,
  Link2,
  Calendar,
  Layers,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { api } from '../services/api';
import { GoogleAdsStatus, Campaign, MetricsSummary, ChartDataPoint } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface DashboardViewProps {
  googleAdsStatus: GoogleAdsStatus | null;
  onNavigate: (view: string, data?: any) => void;
  onRefreshStatus: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  googleAdsStatus,
  onNavigate,
  onRefreshStatus,
}) => {
  const [dateRange, setDateRange] = useState<'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS'>('LAST_30_DAYS');
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary>({
    investment: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    averageCpc: 0,
    conversions: 0,
    costPerConversion: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const selectedAccount = googleAdsStatus?.selectedAccount;
  const isConnected = googleAdsStatus?.isConnected;

  const loadDashboardData = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      // 1. Fetch campaigns
      const campRes = await api.getCampaigns();
      setCampaigns(campRes.campaigns || []);

      // 2. Fetch real Google Ads API metrics
      if (isConnected && selectedAccount) {
        const reportRes = await api.getReports(dateRange);
        if (reportRes.apiError) {
          setApiError(reportRes.apiError);
        }
        setMetrics(reportRes.metricsSummary);
        setChartData(reportRes.chartData || []);
      }
    } catch (err: any) {
      setApiError(err.message || 'Erro ao carregar dados do dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, isConnected, selectedAccount?.id]);

  const handleToggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    setActionLoadingId(campaignId);
    try {
      const nextStatus = currentStatus === 'ENABLED' ? 'PAUSED' : 'ENABLED';
      await api.updateCampaignStatus(campaignId, nextStatus);
      await loadDashboardData();
    } catch (err: any) {
      alert(`Falha ao alterar status da campanha: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Painel Principal</span>
            {selectedAccount && (
              <span className="text-xs text-slate-400">• Conta: <strong className="text-slate-200">{selectedAccount.descriptiveName}</strong> ({selectedAccount.customerId})</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Olá, seja bem-vindo ao DivulgadorAds.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe o desempenho de suas campanhas na Google Ads API em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-50"
            title="Atualizar dados da API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* New Campaign Button */}
          <button
            onClick={() => onNavigate('new-campaign')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* Warning if Google Ads is not connected */}
      {!isConnected && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-300">Integração não configurada</h3>
              <p className="text-xs text-amber-200/80 mt-0.5 max-w-2xl leading-relaxed">
                Conecte sua conta do Google Ads para publicar anúncios e visualizar métricas reais de cliques, impressões e conversões. O DivulgadorAds não gera métricas simuladas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('integrations')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Link2 className="w-4 h-4" />
            Conectar Google Ads
          </button>
        </div>
      )}

      {/* Date Range Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Período de Análise:</span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'TODAY', label: 'Hoje' },
            { id: 'LAST_7_DAYS', label: '7 dias' },
            { id: 'LAST_30_DAYS', label: '30 dias' },
            { id: 'LAST_90_DAYS', label: '90 dias' },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateRange === range.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Investimento */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Investimento Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            R$ {metrics.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Custo veiculado no Google</div>
        </div>

        {/* Impressões */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Impressões</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics.impressions.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Exibições nos resultados de busca</div>
        </div>

        {/* Cliques */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Cliques no Anúncio</span>
            <MousePointerClick className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics.clicks.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Visitas geradas para seu site</div>
        </div>

        {/* CTR */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Taxa de Cliques (CTR)</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics.ctr.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Relevância e atratividade</div>
        </div>

        {/* CPC Médio */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Custo Médio por Clique</span>
            <Coins className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            R$ {metrics.averageCpc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Custo médio por visita</div>
        </div>

        {/* Conversões */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Conversões</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics.conversions.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Vendas, leads e contatos</div>
        </div>

        {/* Custo por Conversão (CPA) */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl sm:col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Custo por Conversão (CPA)</span>
            <BadgePercent className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            R$ {metrics.costPerConversion.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Investimento médio por lead ou venda</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investimento vs Cliques */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Investimento e Cliques</h3>
              <p className="text-xs text-slate-400">Evolução diária dos gastos e visitas</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Google Ads API</span>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="cost" name="Investimento (R$)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCost)" />
                  <Area type="monotone" dataKey="clicks" name="Cliques" stroke="#6366f1" fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500">
                <BarChart3 className="w-8 h-8 text-slate-700 mb-2" />
                <p>Nenhum dado de investimento no período selecionado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Impressões vs Conversões */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Impressões e Conversões</h3>
              <p className="text-xs text-slate-400">Alcance de visualizações e metas</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Google Ads API</span>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="impressions" name="Impressões" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversões" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500">
                <BarChart3 className="w-8 h-8 text-slate-700 mb-2" />
                <p>Nenhuma conversão registrada no período.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Campanhas Recentes</h3>
            <p className="text-xs text-slate-400">Gerenciadas diretamente na sua conta Google Ads</p>
          </div>
          <button
            onClick={() => onNavigate('campaigns')}
            className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
          >
            Ver todas
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Campanha</th>
                  <th className="px-4 py-3">Status Google</th>
                  <th className="px-4 py-3">Orçamento Diário</th>
                  <th className="px-4 py-3">ID Google Ads</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {campaigns.slice(0, 5).map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-200">{camp.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{camp.targetUrl}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={camp.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      R$ {Number(camp.budget?.dailyAmount || 20).toFixed(2)}/dia
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {camp.googleCampaignId || 'Pendente'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={actionLoadingId === camp.id}
                          onClick={() => handleToggleCampaignStatus(camp.id, camp.status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                            camp.status === 'ENABLED'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {camp.status === 'ENABLED' ? (
                            <>
                              <Pause className="w-3 h-3" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              Ativar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => onNavigate('campaign-detail', { campaignId: camp.id })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                          title="Ver detalhes"
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
          <div className="p-8 text-center">
            <Layers className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300">Nenhuma campanha criada ainda</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Crie sua primeira campanha com o assistente do DivulgadorAds e anuncie no Google com facilidade.
            </p>
            <button
              onClick={() => onNavigate('new-campaign')}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
            >
              Criar Minha Primeira Campanha
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
