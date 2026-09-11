import React, { useState } from 'react';
import { Smartphone, Monitor, Globe, ExternalLink } from 'lucide-react';

interface GoogleAdPreviewProps {
  businessName?: string;
  finalUrl: string;
  headlines: string[];
  descriptions: string[];
}

export const GoogleAdPreview: React.FC<GoogleAdPreviewProps> = ({
  businessName = 'Minha Empresa',
  finalUrl,
  headlines,
  descriptions,
}) => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Parse display domain
  let displayDomain = 'seusite.com.br';
  try {
    if (finalUrl) {
      const urlObj = new URL(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`);
      displayDomain = urlObj.hostname.replace('www.', '');
    }
  } catch {
    displayDomain = finalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'seusite.com.br';
  }

  // Active headlines preview (first 2 or 3)
  const activeHeadlines = headlines.filter(h => h.trim().length > 0);
  const headlineTitle = activeHeadlines.length > 0
    ? activeHeadlines.slice(0, 3).join(' | ')
    : 'Título do Anúncio 1 | Título 2 | Título 3';

  // Active descriptions preview
  const activeDescriptions = descriptions.filter(d => d.trim().length > 0);
  const descriptionText = activeDescriptions.length > 0
    ? activeDescriptions.slice(0, 2).join(' ')
    : 'Esta é a descrição do anúncio que aparecerá nas buscas do Google para potenciais clientes qualificados.';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header controls */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pré-visualização do Anúncio no Google
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              device === 'mobile'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              device === 'desktop'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
        </div>
      </div>

      {/* Simulated Search Container */}
      <div className="p-6 bg-slate-950/40 flex justify-center">
        <div
          className={`w-full transition-all duration-200 bg-white dark:bg-[#1f2023] text-slate-900 dark:text-[#bdc1c6] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${
            device === 'mobile' ? 'max-w-md' : 'max-w-2xl'
          }`}
        >
          {/* Top Breadcrumb & Ad Tag */}
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-600 dark:text-[#9aa0a6]">
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#303134] flex items-center justify-center text-slate-500 dark:text-[#8ab4f8]">
              <Globe className="w-3 h-3" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-slate-800 dark:text-[#e8eaed] text-[13px]">
                {businessName}
              </span>
              <span className="text-[12px] text-slate-500 dark:text-[#9aa0a6] truncate max-w-[280px]">
                https://{displayDomain}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 mb-1">
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
              Patrocinado
            </span>
          </div>

          {/* Headlines clickable link */}
          <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug break-words">
            {headlineTitle}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-[#bdc1c6] break-words">
            {descriptionText}
          </p>

          {/* Sitelinks simulation */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#3c4043] flex flex-wrap gap-2 text-xs text-[#1a0dab] dark:text-[#8ab4f8]">
            <span className="cursor-pointer hover:underline">Fale Conosco</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="cursor-pointer hover:underline">Serviços e Preços</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="cursor-pointer hover:underline">Solicitar Orçamento</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          Formato: Responsive Search Ad (Google Ads API)
        </span>
        <span>{activeHeadlines.length}/15 títulos • {activeDescriptions.length}/4 descrições</span>
      </div>
    </div>
  );
};
