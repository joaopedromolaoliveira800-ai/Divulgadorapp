import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, AlertCircle, Plus, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { GeneratedAdCopy } from '../../types';

interface AiAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: {
    empresa?: string;
    site?: string;
  };
  onApplyGenerated: (data: GeneratedAdCopy) => void;
}

export const AiAdModal: React.FC<AiAdModalProps> = ({
  isOpen,
  onClose,
  initialValues,
  onApplyGenerated,
}) => {
  const [empresa, setEmpresa] = useState(initialValues.empresa || '');
  const [produto, setProduto] = useState('');
  const [servico, setServico] = useState('');
  const [publico, setPublico] = useState('Pequenas e médias empresas buscando atrair mais clientes na internet');
  const [diferencial, setDiferencial] = useState('Atendimento rápido, especialistas certificados, suporte humanizado');
  const [site, setSite] = useState(initialValues.site || 'https://');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedAdCopy | null>(null);

  if (!isOpen) return null;

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
        setResult(res.data);
      } else {
        throw new Error('Não foi possível gerar os anúncios.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar à IA do DivulgadorAds. Verifique sua chave de API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyGenerated(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">IA do DivulgadorAds</h3>
              <p className="text-xs text-slate-400">Geração de Responsive Search Ads e palavras-chave de alta conversão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Compliance Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Diretrizes de Qualidade Google Ads:</span>
              <p className="mt-0.5 text-cyan-200/80">
                A IA foi instruída para gerar títulos com até 30 caracteres e descrições com até 90 caracteres, sem promessas enganosas ou termos banidos pelo Google.
              </p>
            </div>
          </div>

          {!result ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Ex: AutoMax Soluções"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Endereço do Site (URL Final) *
                  </label>
                  <input
                    type="url"
                    required
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    placeholder="https://suaempresa.com.br"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Produto Principal
                  </label>
                  <input
                    type="text"
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    placeholder="Ex: Software de Automação de WhatsApp"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                    Serviço Principal
                  </label>
                  <input
                    type="text"
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                    placeholder="Ex: Consultoria e Implantação de CRM"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Público-Alvo *
                </label>
                <input
                  type="text"
                  required
                  value={publico}
                  onChange={(e) => setPublico(e.target.value)}
                  placeholder="Ex: Dentistas, clínicas, advogados ou donos de e-commerce"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Diferencial Competitivo *
                </label>
                <textarea
                  rows={2}
                  required
                  value={diferencial}
                  onChange={(e) => setDiferencial(e.target.value)}
                  placeholder="Ex: Garantia de satisfação, teste grátis 7 dias, atendimento em até 5 minutos"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando Anúncios com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Títulos, Descrições e Palavras
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Generated Headlines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Títulos Gerados ({result.headlines.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Máx 30 caracteres cada</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.headlines.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      <span className="font-medium truncate pr-2">{hl}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        hl.length <= 30 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {hl.length}/30
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Descriptions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Descrições Geradas ({result.descriptions.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Máx 90 caracteres cada</span>
                </div>
                <div className="space-y-2">
                  {result.descriptions.map((desc, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                    >
                      <span className="pr-3 leading-relaxed">{desc}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        desc.length <= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {desc.length}/90
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Keywords */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Palavras-Chave Sugeridas ({result.keywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs"
                    >
                      <span>{kw.text}</span>
                      <span className="text-[10px] text-indigo-400/70 font-mono">
                        {kw.matchType === 'EXACT' ? '[exata]' : kw.matchType === 'PHRASE' ? '"frase"' : 'ampla'}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Negative Keywords */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Palavras-Chave Negativas Recomendadas ({result.negativeKeywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.negativeKeywords.map((neg, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs"
                    >
                      -{neg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {result && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Voltar e Gerar Novamente
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              Aplicar na Campanha
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
