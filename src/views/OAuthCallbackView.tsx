import React, { useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export const OAuthCallbackView: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (window.opener) {
      if (code) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code }, '*');
        setTimeout(() => window.close(), 1500);
      } else if (error) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error }, '*');
        setTimeout(() => window.close(), 2500);
      }
    }
  }, []);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Falha na Autorização</h2>
            <p className="text-xs text-slate-400">{error}</p>
            <p className="text-[11px] text-slate-500">Esta janela será fechada automaticamente...</p>
          </>
        ) : code ? (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Autorizado com Sucesso!</h2>
            <p className="text-xs text-slate-300">Conectando sua conta Google Ads ao DivulgadorAds...</p>
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto mt-2" />
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300">Processando retorno do Google...</p>
          </>
        )}
      </div>
    </div>
  );
};
