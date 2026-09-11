import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  MousePointerClick,
  Eye,
  Percent,
  Coins,
  Target,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../services/api';
import { GoogleAdsStatus, MetricsSummary, ChartDataPoint } from '../types';

interface ReportsViewProps {
  googleAdsStatus: GoogleAdsStatus | null;
  onNavigate: (view: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ googleAdsStatus, onNavigate }) => {
  const [dateRange, setDateRange] = useState<'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS'>('LAST_30_DAYS');
  const [isLoading, setIsLoading] = useState(true);
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
  const [campaignsList, setCampaignsList] = useState<any[]>([]);

  const isConnected = googleAdsStatus?.isConnected;
  const selectedAccount = googleAdsStatus?.selectedAccount;

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReports(dateRange);
      setMetrics(res.metricsSummary);
      setChartData(res.chartData || []);
      setCampaignsList(res.campaignsList || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [dateRange, isConnected, selectedAccount?.id]);

  const handleExportCsv = () => {
    if (campaignsList.length === 0 && chartData.length === 0) {
      alert('Nenhum dado para exportar no período.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Data,Investimento (R$),Cliques,Impressoes,Conversoes\n';

    chartData.forEach((row) => {
      csvContent += `${row.date},${row.cost.toFixed(2)},${row.clicks},${row.impressions},${row.conversions}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `divulgadorads_relatorio_${dateRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Inteligência & Desempenho
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Relatórios de Publicidade
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Métricas oficiais do Google Ads: investimento, cliques, conversões e custo por lead.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadReports}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Warning if disconnected */}
      {!isConnected && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Conecte sua conta do Google Ads para puxar dados reais de campanhas.</span>
          </div>
          <button
            onClick={() => onNavigate('integrations')}
            className="font-bold underline text-amber-200"
          >
            Conectar
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 w-fit">
        {[
          { id: 'TODAY', label: 'Hoje' },
          { id: 'LAST_7_DAYS', label: 'Últimos 7 dias' },
          { id: 'LAST_30_DAYS', label: 'Últimos 30 dias' },
          { id: 'LAST_90_DAYS', label: 'Últimos 90 dias' },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setDateRange(r.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              dateRange === r.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Investimento</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            R$ {metrics.investment.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Cliques</span>
            <MousePointerClick className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {metrics.clicks.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>CTR Médio</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {metrics.ctr.toFixed(2)}%
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Conversões</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {metrics.conversions.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Investimento e Desempenho Diário</h3>
          <span className="text-xs text-slate-400 font-mono">Google Ads API Oficial</span>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="cost" name="Investimento (R$)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" name="Cliques" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500">
              <BarChart3 className="w-10 h-10 text-slate-700 mb-2" />
              <p>Nenhuma métrica reportada pelo Google no período selecionado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaigns Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Desempenho por Campanha</h3>
        </div>

        {campaignsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Campanha</th>
                  <th className="px-4 py-3">Custo (R$)</th>
                  <th className="px-4 py-3">Cliques</th>
                  <th className="px-4 py-3">Impressões</th>
                  <th className="px-4 py-3">CTR</th>
                  <th className="px-4 py-3">CPC Médio</th>
                  <th className="px-4 py-3">Conversões</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {campaignsList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-3.5 font-semibold text-slate-200">{c.name}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-200">R$ {c.cost.toFixed(2)}</td>
                    <td className="px-4 py-3.5">{c.clicks}</td>
                    <td className="px-4 py-3.5">{c.impressions}</td>
                    <td className="px-4 py-3.5">{c.ctr.toFixed(2)}%</td>
                    <td className="px-4 py-3.5 font-mono">R$ {c.averageCpc.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400">{c.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhuma campanha com dados no período.
          </div>
        )}
      </div>
    </div>
  );
};
