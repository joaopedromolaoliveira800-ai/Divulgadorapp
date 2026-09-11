import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  Send,
  HelpCircle,
  Smartphone,
  Monitor,
  Tag,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { GeneratedAdCopy } from '../types';
import { GoogleAdPreview } from '../components/common/GoogleAdPreview';

interface AiStudioViewProps {
  onNavigate: (view: string, data?: any) => void;
}

export const AiStudioView: React.FC<AiStudioViewProps> = ({ onNavigate }) => {
  const [empresa, setEmpresa] = useState('AutoMax Peças e Serviços');
  const [produto, setProduto] = useState('Troca de Óleo e Freios');
  const [servico, setServico] = useState('Revisão Preventiva Completa');
  const [publico, setPublico] = useState('Motoristas e proprietários de veículos da região');
  const [diferencial, setDiferencial] = useState('Garantia de 1 ano, peças originais, parcelamento em 10x sem juros');
  const [site, setSite] = useState('https://automaxservicos.com.br');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedAdCopy | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.generateAdWithAi({
        empresa,
        produto,
        servico,
        publico,
        diferencial,
        site,
      });

      if (res.success && res.data) {
        setGenerated(res.data);
      } else {
        throw new Error('Falha ao gerar textos.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao comunicar com a IA do DivulgadorAds.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(text);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Inteligência Artificial DivulgadorAds
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Estúdio de Criação com IA
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gere anúncios de alta conversão para o Google Ads, com contagem exata de caracteres e palavras-chave qualificadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Dados do seu Negócio</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa *</label>
              <input
                type="text"
                required
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço do Site *</label>
              <input
                type="url"
                required
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Produto Principal</label>
              <input
                type="text"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serviço Principal</label>
              <input
                type="text"
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Público-Alvo *</label>
              <input
                type="text"
                required
                value={publico}
                onChange={(e) => setPublico(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Diferencial Competitivo *</label>
              <textarea
                rows={2}
                required
                value={diferencial}
                onChange={(e) => setDiferencial(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Anúncios & Palavras
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results / Preview */}
        <div className="lg:col-span-7 space-y-4">
          {/* Ad Preview */}
          <GoogleAdPreview
            businessName={empresa}
            finalUrl={site}
            headlines={
              generated?.headlines && generated.headlines.length > 0
                ? generated.headlines
                : ['Títulos Gerados pela IA', 'Soluções Sob Medida', 'Solicite Orçamento']
            }
            descriptions={
              generated?.descriptions && generated.descriptions.length > 0
                ? generated.descriptions
                : ['Descrições detalhadas e envolventes respeitando o limite oficial de 90 caracteres do Google Ads.']
            }
          />

          {generated ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              {/* Headlines with copy action */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-300">Títulos Criados</h4>
                  <span className="text-[11px] text-slate-500">Clique para copiar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {generated.headlines.map((hl, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(hl)}
                      className="p-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <span className="text-xs text-slate-200 truncate pr-2">{hl}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{hl.length}/30</span>
                        {copiedItem === hl ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptions with copy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-300">Descrições Criadas</h4>
                  <span className="text-[11px] text-slate-500">Clique para copiar</span>
                </div>
                <div className="space-y-2">
                  {generated.descriptions.map((desc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(desc)}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer flex items-start justify-between group transition-colors text-xs"
                    >
                      <p className="text-slate-300 leading-relaxed pr-3">{desc}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{desc.length}/90</span>
                        {copiedItem === desc ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-300 mb-2">Palavras-Chave Estratégicas</h4>
                <div className="flex flex-wrap gap-2">
                  {generated.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs flex items-center gap-1.5"
                    >
                      <span>{kw.text}</span>
                      <span className="text-[10px] text-indigo-400/60 font-mono">
                        {kw.matchType === 'EXACT' ? '[exata]' : kw.matchType === 'PHRASE' ? '"frase"' : 'ampla'}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: Criar Campanha com estes dados */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('new-campaign')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md shadow-emerald-500/20"
                >
                  Usar Textos para Criar Campanha Oficial
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
              Preencha os dados do seu negócio ao lado e clique em "Gerar Anúncios & Palavras" para obter copies certificadas pelo Google Ads.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
