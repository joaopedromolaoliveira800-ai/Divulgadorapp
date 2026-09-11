import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Target,
  Globe,
  MapPin,
  DollarSign,
  Search,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { GoogleAdsStatus, CampaignObjective, Keyword, KeywordMatchType, GeneratedAdCopy } from '../types';
import { GoogleAdPreview } from '../components/common/GoogleAdPreview';
import { AiAdModal } from '../components/campaigns/AiAdModal';

interface NewCampaignWizardProps {
  googleAdsStatus: GoogleAdsStatus | null;
  onNavigate: (view: string, data?: any) => void;
  onRefreshStatus: () => void;
}

export const NewCampaignWizard: React.FC<NewCampaignWizardProps> = ({
  googleAdsStatus,
  onNavigate,
  onRefreshStatus,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Campaign Form State
  const [objective, setObjective] = useState<CampaignObjective>('GET_CLIENTS');
  const [name, setName] = useState('DivulgadorAds - Clientes Qualificados');
  const [targetUrl, setTargetUrl] = useState('https://suaempresa.com.br');
  const [locationTarget, setLocationTarget] = useState('Brasil (Todo o país)');
  const [dailyBudget, setDailyBudget] = useState<number>(20);

  // Keywords State
  const [keywords, setKeywords] = useState<Keyword[]>([
    { text: 'serviço especializado', matchType: 'PHRASE' },
    { text: 'empresa de confiança', matchType: 'PHRASE' },
    { text: 'orçamento de serviço', matchType: 'EXACT' },
  ]);
  const [newKeywordText, setNewKeywordText] = useState('');
  const [newKeywordMatch, setNewKeywordMatch] = useState<KeywordMatchType>('PHRASE');

  // Negative Keywords State
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([
    'grátis',
    'de graça',
    'reclame aqui',
    'download',
    'pdf',
  ]);
  const [newNegativeText, setNewNegativeText] = useState('');

  // Ad Copy State
  const [headlines, setHeadlines] = useState<string[]>([
    'Atendimento Ágil e Seguro',
    'Especialistas Certificados',
    'Solicite um Orçamento Hoje',
    'Soluções Sob Medida',
  ]);
  const [descriptions, setDescriptions] = useState<string[]>([
    'Oferecemos soluções completas para sua empresa com suporte dedicado e transparente.',
    'Entre em contato agora mesmo e fale com nossos especialistas para tirar dúvidas.',
  ]);

  // Review & Confirmation
  const [confirmedReview, setConfirmedReview] = useState(false);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<any | null>(null);
  const [publishError, setPublishError] = useState<any | null>(null);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const selectedAccount = googleAdsStatus?.selectedAccount;
  const isConnected = googleAdsStatus?.isConnected;

  // Monthly budget calculation
  const monthlyEstimated = (dailyBudget * 30.4).toFixed(2);

  const steps = [
    { num: 1, title: 'Objetivo' },
    { num: 2, title: 'Empresa & Site' },
    { num: 3, title: 'Local & Orçamento' },
    { num: 4, title: 'Palavras-Chave' },
    { num: 5, title: 'Criar Anúncios' },
    { num: 6, title: 'Revisão & Publicação' },
  ];

  // Helper for adding keyword
  const handleAddKeyword = () => {
    if (!newKeywordText.trim()) return;
    setKeywords([...keywords, { text: newKeywordText.trim(), matchType: newKeywordMatch }]);
    setNewKeywordText('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleAddNegative = () => {
    if (!newNegativeText.trim()) return;
    setNegativeKeywords([...negativeKeywords, newNegativeText.trim()]);
    setNewNegativeText('');
  };

  const handleRemoveNegative = (index: number) => {
    setNegativeKeywords(negativeKeywords.filter((_, i) => i !== index));
  };

  // Headline & Description handlers
  const handleHeadlineChange = (index: number, val: string) => {
    const updated = [...headlines];
    updated[index] = val.slice(0, 30);
    setHeadlines(updated);
  };

  const handleAddHeadline = () => {
    if (headlines.length < 15) {
      setHeadlines([...headlines, '']);
    }
  };

  const handleRemoveHeadline = (index: number) => {
    if (headlines.length > 3) {
      setHeadlines(headlines.filter((_, i) => i !== index));
    }
  };

  const handleDescriptionChange = (index: number, val: string) => {
    const updated = [...descriptions];
    updated[index] = val.slice(0, 90);
    setDescriptions(updated);
  };

  const handleAddDescription = () => {
    if (descriptions.length < 4) {
      setDescriptions([...descriptions, '']);
    }
  };

  const handleRemoveDescription = (index: number) => {
    if (descriptions.length > 2) {
      setDescriptions(descriptions.filter((_, i) => i !== index));
    }
  };

  // Apply AI Generated Data
  const handleApplyAiData = (data: GeneratedAdCopy) => {
    if (data.headlines.length > 0) {
      setHeadlines(data.headlines.slice(0, 10));
    }
    if (data.descriptions.length > 0) {
      setDescriptions(data.descriptions.slice(0, 4));
    }
    if (data.keywords.length > 0) {
      setKeywords(data.keywords);
    }
    if (data.negativeKeywords.length > 0) {
      setNegativeKeywords(data.negativeKeywords);
    }
  };

  // Submit Official Publication to Google Ads API
  const handlePublish = async () => {
    if (!confirmedReview) {
      alert('Por favor, confirme que você revisou os dados e o orçamento da campanha.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const payload = {
        objective,
        name,
        targetUrl,
        locationTarget,
        dailyBudget: Number(dailyBudget),
        keywords: keywords.map((k) => ({ text: k.text, matchType: k.matchType })),
        negativeKeywords,
        headlines: headlines.filter((h) => h.trim().length > 0),
        descriptions: descriptions.filter((d) => d.trim().length > 0),
      };

      const res = await api.publishCampaign(payload);

      if (res.success) {
        setPublishSuccess(res);
      } else {
        setPublishError(res);
      }
    } catch (err: any) {
      setPublishError({
        error: err.message || 'Não foi possível publicar sua campanha.',
        googleMessage: err.data?.googleMessage || err.data?.error,
        requestId: err.data?.requestId,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Toggle status after publication
  const handleActivatePublished = async () => {
    if (!publishSuccess?.campaign?.id) return;
    try {
      await api.updateCampaignStatus(publishSuccess.campaign.id, 'ENABLED');
      setPublishSuccess({
        ...publishSuccess,
        status: 'ENABLED',
        message: 'Campanha ativada com sucesso no Google Ads!',
      });
    } catch (err: any) {
      alert(`Falha ao ativar campanha: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Criador de Campanhas
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Nova Campanha Google Ads
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar Anúncio com IA</span>
          </button>
        </div>

        {/* Selected Account Bar */}
        <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Conta Google Ads de destino:</span>
            {selectedAccount ? (
              <span className="font-semibold text-slate-200">
                {selectedAccount.descriptiveName} ({selectedAccount.customerId})
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">Nenhuma conta conectada</span>
            )}
          </div>
          {!isConnected && (
            <button
              onClick={() => onNavigate('integrations')}
              className="text-cyan-400 font-semibold hover:underline"
            >
              Conectar nas Integrações
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-6 gap-2 mb-8">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`flex flex-col items-center text-center pb-2 border-b-2 transition-colors ${
              currentStep === s.num
                ? 'border-cyan-400 text-cyan-300'
                : currentStep > s.num
                ? 'border-emerald-500 text-emerald-400'
                : 'border-slate-800 text-slate-600'
            }`}
          >
            <span className="text-[10px] font-bold uppercase">Passo {s.num}</span>
            <span className="text-xs font-semibold truncate w-full hidden sm:block">
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* SUCCESS SCREEN */}
      {publishSuccess ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Campanha criada com sucesso!</h2>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Sua campanha foi publicada na Google Ads API oficial sob o ID{' '}
              <span className="font-mono text-cyan-400 font-bold">
                {publishSuccess.googleCampaignId || publishSuccess.campaign?.googleCampaignId}
              </span>
              .
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Nome:</span>
              <span className="font-semibold text-white">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status no Google Ads:</span>
              <span className={`font-bold ${publishSuccess.status === 'ENABLED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {publishSuccess.status === 'ENABLED' ? 'ATIVA (ENABLED)' : 'PAUSADA (PAUSED) por segurança'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Orçamento Diário:</span>
              <span className="font-semibold text-white">R$ {Number(dailyBudget).toFixed(2)}/dia</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {publishSuccess.status !== 'ENABLED' && (
              <button
                type="button"
                onClick={handleActivatePublished}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                Ativar Campanha no Google Agora
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* STEP BY STEP FORM */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* STEP 1: OBJETIVO */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Qual é seu objetivo principal?</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione o foco que melhor define a meta do seu anúncio no Google.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'GET_CLIENTS',
                    title: 'Conseguir clientes',
                    desc: 'Ideal para prestadores de serviços, consultores e negócios locais.',
                  },
                  {
                    id: 'LEADS',
                    title: 'Receber leads',
                    desc: 'Foco em formulários de contato, orçamentos e conversas no WhatsApp.',
                  },
                  {
                    id: 'SELL_PRODUCTS',
                    title: 'Vender produtos',
                    desc: 'Direcione compradores qualificados para páginas de produtos e e-commerce.',
                  },
                  {
                    id: 'WEBSITE_VISITS',
                    title: 'Receber visitas no site',
                    desc: 'Aumente o tráfego qualificado de pessoas interessadas no seu nicho.',
                  },
                  {
                    id: 'BRAND_AWARENESS',
                    title: 'Divulgar empresa',
                    desc: 'Destaque o nome da sua marca para pessoas pesquisando na sua região.',
                  },
                ].map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => setObjective(obj.id as CampaignObjective)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      objective === obj.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{obj.title}</h4>
                      {objective === obj.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{obj.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: NOME & SITE */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Identificação da Campanha e Website</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Defina um nome de controle interno e o endereço da página de destino.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: DivulgadorAds - Clientes São Paulo"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Este nome será exibido na sua conta Google Ads e nos relatórios.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endereço do Site (URL Final) *
                  </label>
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://suaempresa.com.br"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Para onde as pessoas serão direcionadas quando clicarem no seu anúncio.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOCALIZAÇÃO & ORÇAMENTO */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Localização e Orçamento Diário</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Controle onde os anúncios aparecem e quanto quer investir por dia.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Localização de Exibição
                  </label>
                  <input
                    type="text"
                    value={locationTarget}
                    onChange={(e) => setLocationTarget(e.target.value)}
                    placeholder="Ex: Brasil, São Paulo - SP, Rio de Janeiro"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Região geográfica onde seus clientes em potencial estão localizados.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quanto você deseja investir por dia? *
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      min={5}
                      step={1}
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(Number(e.target.value))}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Calculated monthly estimation */}
                  <div className="mt-3 p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
                    <div>
                      <span className="font-semibold">Estimativa mensal calculada:</span>
                      <p className="text-[11px] text-cyan-200/80">
                        R$ {dailyBudget} x 30,4 dias médios do Google Ads
                      </p>
                    </div>
                    <span className="text-base font-black text-white font-mono">
                      R$ {monthlyEstimated}/mês
                    </span>
                  </div>

                  {/* Mandated Financial Notice */}
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Importante:</strong> O orçamento de publicidade será administrado e faturado diretamente pela sua conta Google Ads. O DivulgadorAds não retém nem cobra comissão sobre o investimento em anúncios.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PALAVRAS-CHAVE */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Palavras-Chave de Busca</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Termos que as pessoas pesquisam no Google para encontrar seu negócio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sugerir com IA
                </button>
              </div>

              {/* Add Keyword Input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newKeywordText}
                  onChange={(e) => setNewKeywordText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Ex: consultoria financeira empresarial"
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={newKeywordMatch}
                  onChange={(e) => setNewKeywordMatch(e.target.value as KeywordMatchType)}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="PHRASE">Frase ("termo")</option>
                  <option value="EXACT">Exata ([termo])</option>
                  <option value="BROAD">Ampla (termo)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {/* Keywords List */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Palavras-chave Ativas ({keywords.length})
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="font-medium">
                        {kw.matchType === 'EXACT' ? `[${kw.text}]` : kw.matchType === 'PHRASE' ? `"${kw.text}"` : kw.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(idx)}
                        className="text-slate-500 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Negative Keywords Section */}
              <div className="pt-4 border-t border-slate-800">
                <div className="mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Palavras-Chave Negativas (Filtro Anti-Desperdício)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Seu anúncio NÃO aparecerá se a pesquisa do usuário contiver estas palavras.
                  </p>
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newNegativeText}
                    onChange={(e) => setNewNegativeText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNegative())}
                    placeholder="Ex: gratis, pdf, pirata, reclame aqui"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNegative}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Adicionar Negativa
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {negativeKeywords.map((neg, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-300 text-xs"
                    >
                      <span>-{neg}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNegative(idx)}
                        className="text-rose-400 hover:text-rose-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ANÚNCIOS (RESPONSIVE SEARCH ADS) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Textos do Anúncio (Responsive Search Ad)</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Crie títulos persuasivos de até 30 caracteres e descrições de até 90 caracteres.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar com IA
                </button>
              </div>

              {/* Live Preview of Responsive Search Ad */}
              <div>
                <GoogleAdPreview
                  businessName={name.replace('DivulgadorAds - ', '') || 'Minha Empresa'}
                  finalUrl={targetUrl}
                  headlines={headlines}
                  descriptions={descriptions}
                />
              </div>

              {/* Headlines Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-slate-300">
                    Títulos ({headlines.length}/15) • Mínimo 3 obrigatórios
                  </label>
                  {headlines.length < 15 && (
                    <button
                      type="button"
                      onClick={handleAddHeadline}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Título
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {headlines.map((hl, idx) => (
                    <div key={idx} className="relative">
                      <input
                        type="text"
                        maxLength={30}
                        value={hl}
                        onChange={(e) => handleHeadlineChange(idx, e.target.value)}
                        placeholder={`Título ${idx + 1}`}
                        className="w-full pl-3 pr-14 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono ${hl.length >= 28 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {hl.length}/30
                        </span>
                        {headlines.length > 3 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHeadline(idx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptions Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-slate-300">
                    Descrições ({descriptions.length}/4) • Mínimo 2 obrigatórias
                  </label>
                  {descriptions.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddDescription}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Descrição
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {descriptions.map((desc, idx) => (
                    <div key={idx} className="relative">
                      <textarea
                        rows={2}
                        maxLength={90}
                        value={desc}
                        onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                        placeholder={`Descrição ${idx + 1}`}
                        className="w-full pl-3 pr-16 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                      />
                      <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono ${desc.length >= 85 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {desc.length}/90
                        </span>
                        {descriptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDescription(idx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVISÃO & PUBLICAÇÃO REAL */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Revisão e Publicação no Google Ads</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Confira todos os parâmetros antes de disparar a criação na Google Ads API oficial.
                </p>
              </div>

              {/* Error notice if returned */}
              {publishError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Não foi possível publicar sua campanha.
                  </div>
                  <p>{publishError.error || publishError.googleMessage || 'Erro retornado pela Google Ads API.'}</p>
                  {publishError.requestId && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Request ID Google: {publishError.requestId}
                    </div>
                  )}
                </div>
              )}

              {/* Review summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-slate-300 uppercase text-[11px] border-b border-slate-800 pb-1">
                    Configurações Gerais
                  </div>
                  <div>
                    <span className="text-slate-400">Conta Destino:</span>{' '}
                    <span className="font-semibold text-white">
                      {selectedAccount?.descriptiveName || 'Pendente de seleção'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Nome:</span>{' '}
                    <span className="font-semibold text-white">{name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">URL Final:</span>{' '}
                    <span className="font-mono text-cyan-400 break-all">{targetUrl}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Localização:</span>{' '}
                    <span className="font-semibold text-white">{locationTarget}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-slate-300 uppercase text-[11px] border-b border-slate-800 pb-1">
                    Orçamento & Status
                  </div>
                  <div>
                    <span className="text-slate-400">Investimento Diário:</span>{' '}
                    <span className="font-bold text-white font-mono">R$ {Number(dailyBudget).toFixed(2)}/dia</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Estimativa Mensal:</span>{' '}
                    <span className="font-bold text-cyan-400 font-mono">R$ {monthlyEstimated}/mês</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status Inicial:</span>{' '}
                    <span className="text-amber-400 font-semibold">PAUSADA (PAUSED) por segurança</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Palavras-Chave:</span>{' '}
                    <span className="font-semibold text-white">{keywords.length} ativas</span>
                  </div>
                </div>
              </div>

              {/* Ad Preview */}
              <div>
                <GoogleAdPreview
                  businessName={name.replace('DivulgadorAds - ', '') || 'Minha Empresa'}
                  finalUrl={targetUrl}
                  headlines={headlines}
                  descriptions={descriptions}
                />
              </div>

              {/* Mandatory User Confirmation Checkbox */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedReview}
                    onChange={(e) => setConfirmedReview(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    Confirmo que revisei os dados, a URL de destino e o orçamento diário da campanha. Entendo que o valor diário de <strong>R$ {Number(dailyBudget).toFixed(2)}</strong> será faturado diretamente pelo Google Ads e que a campanha será criada inicialmente pausada para minha conferência.
                  </span>
                </label>
              </div>

              {/* Publish Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isPublishing || !confirmedReview}
                  onClick={handlePublish}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publicando na Google Ads API Oficial...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Publicar no Google Ads
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls (Back / Next) */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
              >
                Próximo Passo
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Ad Generator Modal */}
      <AiAdModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialValues={{
          empresa: name.replace('DivulgadorAds - ', ''),
          site: targetUrl,
        }}
        onApplyGenerated={handleApplyAiData}
      />
    </div>
  );
};
