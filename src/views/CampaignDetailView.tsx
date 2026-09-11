import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  ExternalLink,
  Target,
  DollarSign,
  MapPin,
  Search,
  Tag,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { Campaign } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { GoogleAdPreview } from '../components/common/GoogleAdPreview';

interface CampaignDetailViewProps {
  campaignId: string;
  onNavigate: (view: string) => void;
}

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaignId,
  onNavigate,
}) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCampaign(campaignId);
      setCampaign(res.campaign);
    } catch (err) {
      console.error('Error fetching campaign detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const handleToggleStatus = async () => {
    if (!campaign) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus = campaign.status === 'ENABLED' ? 'PAUSED' : 'ENABLED';
      await api.updateCampaignStatus(campaign.id, nextStatus);
      await loadCampaign();
    } catch (err: any) {
      alert(`Erro ao alterar status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Carregando detalhes da campanha...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-24 text-center">
        <h3 className="font-bold text-white text-base">Campanha não encontrada</h3>
        <button
          onClick={() => onNavigate('campaigns')}
          className="mt-4 px-4 py-2 bg-slate-800 rounded-xl text-xs text-slate-200"
        >
          Voltar para Campanhas
        </button>
      </div>
    );
  }

  const adGroup = campaign.adGroups?.[0];
  const ad = adGroup?.ads?.[0];
  const keywords = adGroup?.keywords || [];
  const negativeKeywords = adGroup?.negativeKeywords || [];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('campaigns')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Campanhas
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              campaign.status === 'ENABLED'
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isUpdatingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : campaign.status === 'ENABLED' ? (
              <>
                <Pause className="w-4 h-4" />
                Pausar Campanha no Google
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Ativar Campanha no Google
              </>
            )}
          </button>
        </div>
      </div>

      {/* Campaign Summary Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-slate-400 font-mono">
                ID Google Ads: {campaign.googleCampaignId || 'Pendente'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">{campaign.name}</h1>
            <a
              href={campaign.targetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-1"
            >
              <span>{campaign.targetUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-xs text-slate-400">Orçamento Diário</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              R$ {Number(campaign.budget?.dailyAmount || 20).toFixed(2)}/dia
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">
              ~ R$ {(Number(campaign.budget?.dailyAmount || 20) * 30.4).toFixed(2)}/mês
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 block">Objetivo</span>
            <span className="font-semibold text-slate-200">{campaign.objective}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Localização</span>
            <span className="font-semibold text-slate-200">{campaign.locationTarget || 'Brasil'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tipo de Rede</span>
            <span className="font-semibold text-slate-200">Rede de Pesquisa Google</span>
          </div>
          <div>
            <span className="text-slate-500 block">Data de Criação</span>
            <span className="font-semibold text-slate-200">
              {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Ad Preview */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Anúncio Publicado (Responsive Search Ad)</h3>
        <GoogleAdPreview
          businessName={campaign.name.replace('DivulgadorAds - ', '')}
          finalUrl={campaign.targetUrl}
          headlines={ad?.headlines || ['Atendimento Ágil', 'Especialistas', 'Solicite Orçamento']}
          descriptions={
            ad?.descriptions || [
              'Soluções completas com suporte dedicado e confiável para sua empresa.',
              'Fale agora mesmo com nossa equipe e alcance mais clientes.',
            ]
          }
        />
      </div>

      {/* Keywords Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
            <span>Palavras-Chave ({keywords.length})</span>
            <Search className="w-4 h-4 text-cyan-400" />
          </h3>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {keywords.map((kw, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs"
              >
                <span className="font-medium text-slate-200">{kw.text}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                  {kw.matchType === 'EXACT' ? '[exata]' : kw.matchType === 'PHRASE' ? '"frase"' : 'ampla'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
            <span>Palavras Negativas ({negativeKeywords.length})</span>
            <Tag className="w-4 h-4 text-rose-400" />
          </h3>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
            {negativeKeywords.map((neg, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-300 text-xs"
              >
                -{neg.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
