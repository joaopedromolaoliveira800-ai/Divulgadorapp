import React, { useState, useEffect } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Info,
  Key,
  Globe,
  Loader2,
  HelpCircle,
  X,
  Settings,
} from 'lucide-react';
import { api } from '../services/api';
import { GoogleAdsStatus, GoogleAdsAccount } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface IntegrationsViewProps {
  googleAdsStatus: GoogleAdsStatus | null;
  onRefreshStatus: () => void;
  onSelectAccount: (accountId: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  googleAdsStatus,
  onRefreshStatus,
  onSelectAccount,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [copiedDevRedirect, setCopiedDevRedirect] = useState(false);
  const [copiedPreRedirect, setCopiedPreRedirect] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showError403Modal, setShowError403Modal] = useState(false);

  // Direct Credentials Modal
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [inputClientId, setInputClientId] = useState('');
  const [inputClientSecret, setInputClientSecret] = useState('');
  const [inputDevToken, setInputDevToken] = useState('obopXETQW2Vmfba7OhvGQ');
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

  // Direct Auth Link Notice (for iframe / popup blockers)
  const [directAuthUrl, setDirectAuthUrl] = useState<string | null>(null);
  const [showAuthUrlNotice, setShowAuthUrlNotice] = useState(false);

  // In-app Toast message (replaces window.alert for iframes)
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToastNotification({ type, message });
    setTimeout(() => setToastNotification(null), 7000);
  };

  // Manual / Test Account Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualCustomerId, setManualCustomerId] = useState('123-456-7890');
  const [manualName, setManualName] = useState('Minha Conta Google Ads');
  const [manualCurrency, setManualCurrency] = useState('BRL');
  const [manualIsTest, setManualIsTest] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const status = googleAdsStatus;
  const isConnected = status?.isConnected;
  const accounts = status?.accounts || [];
  const selectedAccount = status?.selectedAccount;

  // Listen for OAuth message from callback popup window
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const code = event.data.code;
        try {
          setIsConnecting(true);
          const redirectUri = `${window.location.origin}/auth/callback`;
          await api.exchangeOAuthCode(code, redirectUri);
          onRefreshStatus();
          setShowAuthUrlNotice(false);
          showToast('success', 'Google Ads conectado com sucesso!');
        } catch (err: any) {
          showToast('error', `Erro na autorização do Google: ${err.message}`);
        } finally {
          setIsConnecting(false);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setIsConnecting(false);
        showToast('error', `Erro retornado pelo Google: ${event.data.error}`);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onRefreshStatus]);

  // Handle Save Credentials Directly in UI
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClientId.trim()) {
      showToast('error', 'Informe o Google OAuth Client ID.');
      return;
    }

    setIsSavingCredentials(true);
    try {
      await api.updateGoogleAdsConfig({
        clientId: inputClientId.trim(),
        clientSecret: inputClientSecret.trim(),
        developerToken: inputDevToken.trim(),
      });
      setShowCredentialsModal(false);
      onRefreshStatus();
      showToast('success', 'Credenciais salvas com sucesso! Agora você já pode conectar.');
    } catch (err: any) {
      showToast('error', `Erro ao salvar credenciais: ${err.message}`);
    } finally {
      setIsSavingCredentials(false);
    }
  };

  // Handle Google OAuth Flow
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const currentRedirectUri = `${window.location.origin}/auth/callback`;
      const res = await api.getGoogleOAuthUrl(currentRedirectUri);

      if (res.url) {
        setDirectAuthUrl(res.url);
      }

      // If the client ID format is not .apps.googleusercontent.com (e.g. project id divulgador-506305)
      if (!res.isClientIdValidFormat) {
        setIsConnecting(false);
        setInputClientId(res.currentValue || status?.clientIdSample || '');
        setShowCredentialsModal(true);
        return;
      }

      if (!res.configured || !res.url) {
        showToast('error', res.error || 'Credenciais do Google não configuradas.');
        setIsConnecting(false);
        setInputClientId(status?.clientIdSample || '');
        setShowCredentialsModal(true);
        return;
      }

      // Attempt popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        res.url,
        'GoogleAdsOAuthPopup',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      // Always show notice with direct button in case iframe/browser blocks popup
      setShowAuthUrlNotice(true);
    } catch (err: any) {
      showToast('error', `Erro ao iniciar autenticação: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncAccounts = async () => {
    setIsSyncing(true);
    try {
      await api.syncAccounts();
      onRefreshStatus();
    } catch (err: any) {
      alert(`Erro ao sincronizar contas: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    try {
      await api.connectManualAccount({
        customerId: manualCustomerId,
        descriptiveName: manualName,
        currencyCode: manualCurrency,
        isTestAccount: manualIsTest,
      });
      setShowAddModal(false);
      onRefreshStatus();
    } catch (err: any) {
      setManualError(err.message || 'Erro ao conectar conta.');
    }
  };

  const copyRedirectUri = () => {
    const uri = `${window.location.origin}/auth/callback`;
    navigator.clipboard.writeText(uri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* In-app Toast / Notification Banner */}
      {toastNotification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium ${
            toastNotification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : toastNotification.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Conexão Externa
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Integração Google Ads API
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerenciamento oficial de contas, tokens de desenvolvedor e autorizações OAuth 2.0.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => {
              setInputClientId(status?.clientIdSample || '');
              setShowCredentialsModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            Configurar Credenciais
          </button>

          {isConnected && (
            <button
              onClick={handleSyncAccounts}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              Sincronizar Contas
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Vincular Customer ID
          </button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Link2 className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  {isConnected ? 'Conta Google Ads Conectada' : 'Integração Pendente'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isConnected ? 'OFICIAL v18' : 'NÃO CONECTADO'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                {isConnected
                  ? `Conexão autenticada via OAuth 2.0 (${status?.googleEmail || 'Google User'}). Suas publicações têm acesso à Google Ads API oficial.`
                  : 'Para criar e publicar campanhas reais no Google Ads sem simulações, autorize o DivulgadorAds na sua conta Google.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
            <button
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                isConnected
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : isConnected ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Reconectar Google Ads
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Conectar Google Ads com OAuth
                </>
              )}
            </button>

            {!isConnected && (
              <button
                type="button"
                onClick={() => setShowError403Modal(true)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-center sm:justify-end gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Viu "Erro 403: access_denied"? Resolver aqui
              </button>
            )}
          </div>
        </div>

        {/* Credentials Diagnostics */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <span className="text-slate-500 block">Developer Token</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-slate-200 font-semibold">
                {status?.developerToken || 'obopXETQW2Vmfba7OhvGQ'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 block">Google OAuth Client ID</span>
              <button
                onClick={() => {
                  setInputClientId(status?.clientIdSample || '');
                  setShowCredentialsModal(true);
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Settings className="w-2.5 h-2.5" />
                Alterar
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-200 font-semibold truncate max-w-[170px]" title={status?.clientIdSample}>
                {status?.clientIdConfigured
                  ? status?.isClientIdValidFormat
                    ? 'Configurado (.apps)'
                    : `${status?.clientIdSample || 'ID de Projeto'}`
                  : 'Aguardando credenciais'}
              </span>
              {status?.clientIdConfigured ? (
                status?.isClientIdValidFormat ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <button
                    onClick={() => {
                      setInputClientId(status?.clientIdSample || '');
                      setShowCredentialsModal(true);
                    }}
                    className="text-amber-400 hover:text-amber-300"
                    title="Clique para corrigir o Client ID"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  </button>
                )
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 block">Google Client Secret</span>
              <button
                onClick={() => setShowCredentialsModal(true)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Settings className="w-2.5 h-2.5" />
                Editar
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-200 font-semibold">
                {status?.clientSecretConfigured ? 'Protegido no Servidor' : 'Aguardando credenciais'}
              </span>
              {status?.clientSecretConfigured ? (
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Accounts List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Contas Google Ads Vinculadas ({accounts.length})</h3>
            <p className="text-xs text-slate-400">
              Selecione a conta ativa que será utilizada para a publicação de campanhas.
            </p>
          </div>
        </div>

        {accounts.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {accounts.map((acc) => {
              const isSelected = acc.id === selectedAccount?.id;

              return (
                <div
                  key={acc.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-cyan-950/20' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{acc.descriptiveName}</span>
                      <StatusBadge status={acc.status} isTestAccount={acc.isTestAccount} />
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Conta Selecionada
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>Customer ID: <strong className="text-slate-200">{acc.customerId}</strong></span>
                      <span>Moeda: <strong className="text-slate-200">{acc.currencyCode}</strong></span>
                      <span>Fuso: <strong className="text-slate-200">{acc.timeZone}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold px-3 py-1.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                        <Check className="w-4 h-4" />
                        Conta Ativa
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectAccount(acc.id)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                      >
                        Selecionar esta conta
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            <p>Nenhuma conta Google Ads vinculada no momento.</p>
            <p className="mt-1 text-slate-500">
              Conecte via OAuth ou adicione um Customer ID de teste abaixo.
            </p>
          </div>
        )}
      </div>

      {/* Client ID Warning Banner if Project ID is used */}
      {status?.isClientIdValidFormat === false && status?.clientIdConfigured && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">
                Atenção: GOOGLE_CLIENT_ID configurado como ID do Projeto ({status.clientIdSample})
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Isso causa o erro <strong>Erro 401: invalid_client ("The OAuth client was not found")</strong> no Google. Você precisa criar um "ID do cliente OAuth 2.0" no Google Cloud Console que termina com <code>.apps.googleusercontent.com</code>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
          >
            Ver Como Resolver
          </button>
        </div>
      )}

      {/* Google Cloud Console Setup Helper */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Como configurar no Google Cloud Console</h3>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Guia Erro 401: invalid_client
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Para conectar o OAuth oficial na sua própria conta de desenvolvedor do Google:
        </p>

        <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2">
          <li>
            Acesse o{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              Google Cloud Console (Credenciais) <ExternalLink className="w-3 h-3" />
            </a>{' '}
            no projeto <strong>divulgador-506305</strong>.
          </li>
          <li>
            Clique em <strong>+ Criar Credenciais</strong> &gt; <strong>ID do cliente OAuth</strong> &gt; Tipo <strong>Aplicativo da Web</strong>.
          </li>
          <li>
            Em <strong>URIs de redirecionamento autorizados</strong>, adicione os endereços do app:
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 max-w-xl">
                <code className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-mono text-[11px] truncate flex-1">
                  {`${window.location.origin}/auth/callback`}
                </code>
                <button
                  onClick={copyRedirectUri}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                  title="Copiar URI atual"
                >
                  {copiedRedirect ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 max-w-xl">
                <code className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] truncate flex-1">
                  https://ais-pre-q6a5md6cfdjmhzhtzh5lyv-693086232188.us-west2.run.app/auth/callback
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('https://ais-pre-q6a5md6cfdjmhzhtzh5lyv-693086232188.us-west2.run.app/auth/callback');
                    setCopiedPreRedirect(true);
                    setTimeout(() => setCopiedPreRedirect(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                  title="Copiar URI de Compartilhamento"
                >
                  {copiedPreRedirect ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </li>
          <li>
            Copie o <strong>ID do cliente</strong> (formato: <code>...apps.googleusercontent.com</code>) e o <strong>Segredo do cliente</strong> e adicione nas configurações do AI Studio (ícone de engrenagem).
          </li>
        </ol>
      </div>

      {/* Modal: Erro 401: invalid_client Resolution */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Como Resolver o "Erro 401: invalid_client"</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Esse erro acontece porque o Google recebeu <code>{status?.clientIdSample || 'divulgador-506305'}</code> como Client ID. Esse é o <strong>ID do Projeto Google Cloud</strong>, e não um <strong>ID de Cliente OAuth 2.0</strong>.
            </p>

            <div className="space-y-4 text-xs text-slate-200">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-cyan-400 block">Diferença Importante:</span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-rose-400 font-bold shrink-0">❌ Incorreto:</span>
                  <code className="text-slate-400 font-mono">divulgador-506305</code> (ID do Projeto)
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-400 font-bold shrink-0">✅ Correto:</span>
                  <code className="text-emerald-300 font-mono break-all">1234567890-xyz.apps.googleusercontent.com</code>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-white text-xs">Passo a passo para gerar o Client ID correto:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs">
                  <li>
                    Acesse{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline font-semibold"
                    >
                      console.cloud.google.com/apis/credentials
                    </a>
                  </li>
                  <li>Selecione o projeto <strong>divulgador-506305</strong> no topo.</li>
                  <li>
                    Clique em <strong>+ Criar Credenciais</strong> &gt; <strong>ID do cliente OAuth</strong>.
                  </li>
                  <li>
                    Selecione Tipo de aplicativo: <strong>Aplicativo da Web</strong> (Web Application).
                  </li>
                  <li>
                    Em <strong>URIs de redirecionamento autorizados</strong>, adicione:
                    <div className="mt-1 flex items-center gap-1.5">
                      <code className="p-1.5 bg-slate-950 border border-slate-800 rounded text-cyan-300 text-[10px] truncate flex-1">
                        {`${window.location.origin}/auth/callback`}
                      </code>
                      <button
                        onClick={copyRedirectUri}
                        className="px-2 py-1 bg-slate-800 text-slate-200 rounded text-[10px] font-semibold"
                      >
                        {copiedRedirect ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </li>
                  <li>
                    Clique em <strong>Criar</strong>. O Google exibirá seu <strong>ID do cliente</strong> e <strong>Segredo do cliente</strong>.
                  </li>
                  <li>
                    No AI Studio, abra o menu <strong>Settings (Configurações)</strong> &gt; <strong>Secrets</strong> e atualize:
                    <ul className="list-disc list-inside mt-1 ml-2 text-[11px] text-slate-400">
                      <li><code>GOOGLE_CLIENT_ID</code>: O ID que termina em <code>.apps.googleusercontent.com</code></li>
                      <li><code>GOOGLE_CLIENT_SECRET</code>: O segredo gerado</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Entendi, vou atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Erro 403: access_denied (Usuários de Teste) Resolution */}
      {showError403Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setShowError403Modal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Como Resolver: "Erro 403: access_denied"</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Essa mensagem ("Acesso bloqueado: o app não concluiu a verificação") significa que a sua conexão OAuth <strong>já está funcionando</strong>, mas o aplicativo no Google Cloud está no status <strong>"Em teste"</strong>. Para liberar o login, basta adicionar seu e-mail como <em>Usuário de teste</em>.
            </p>

            <div className="space-y-4 text-xs text-slate-200">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 block text-xs">
                  Solução em 30 Segundos (Passo a Passo):
                </span>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs">
                  <li>
                    Acesse a{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials/consent"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline font-semibold"
                    >
                      Tela de permissão OAuth no Google Cloud ↗
                    </a>
                  </li>
                  <li>
                    Role a página até a seção <strong>"Usuários de teste"</strong> (Test Users).
                  </li>
                  <li>
                    Clique no botão <strong>+ ADD USERS (+ Adicionar usuários)</strong>.
                  </li>
                  <li>
                    Cole o seu e-mail do Google:
                    <div className="mt-1 flex items-center gap-2">
                      <code className="p-1.5 bg-slate-950 border border-slate-800 rounded text-cyan-300 font-mono text-[11px] flex-1">
                        localboostoficial.site@gmail.com
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('localboostoficial.site@gmail.com');
                          showToast('info', 'E-mail copiado!');
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar
                      </button>
                    </div>
                  </li>
                  <li>
                    Clique em <strong>Salvar (Save)</strong>.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                <span className="font-bold text-slate-300 block mb-1">💡 Alternativa (Liberar para qualquer e-mail):</span>
                Na mesma tela de permissão OAuth, clique em <strong>"Publicar aplicativo" (Publish app)</strong>. O Google mudará o status para Produção, permitindo que qualquer conta acesse clicando em <em>Avançado &gt; Acessar (não seguro)</em>.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <a
                href="https://console.cloud.google.com/apis/credentials/consent"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir Google Cloud Console ↗
              </a>

              <button
                onClick={() => {
                  setShowError403Modal(false);
                  handleConnectGoogle();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20"
              >
                Já Adicionei! Conectar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Customer ID / Test Account */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Vincular Conta Google Ads</h3>
            <p className="text-xs text-slate-400 mb-4">
              Informe o Customer ID (10 dígitos) da sua conta ou conta de teste.
            </p>

            <form onSubmit={handleManualAddAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer ID * (10 dígitos)
                </label>
                <input
                  type="text"
                  required
                  value={manualCustomerId}
                  onChange={(e) => setManualCustomerId(e.target.value)}
                  placeholder="123-456-7890"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Amigável da Conta *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Ex: Minha Empresa Ads"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Moeda</label>
                <select
                  value={manualCurrency}
                  onChange={(e) => setManualCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualIsTest}
                    onChange={(e) => setManualIsTest(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-xs text-slate-300">Esta é uma Conta de Teste (Sandbox)</span>
                </label>
              </div>

              {manualError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {manualError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct In-App Credentials Editor */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Configurar Credenciais Google Ads</h3>
                  <p className="text-xs text-slate-400">Insira suas credenciais OAuth 2.0 geradas no Google</p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status?.isClientIdValidFormat === false && (
              <div className="my-3.5 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                <span className="font-bold block mb-1">Atenção ao Formato do Client ID:</span>
                O valor atual é <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-amber-500/20">{status?.clientIdSample || 'divulgador-506305'}</code> (ID do Projeto GCP). O Client ID correto deve terminar com <strong className="text-emerald-400">.apps.googleusercontent.com</strong>.
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">
                    Google OAuth Client ID *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCredentialsModal(false);
                      setShowHelpModal(true);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Como gerar no Google?
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  placeholder="Ex: 1234567890-abcdef.apps.googleusercontent.com"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Exemplo: <code className="text-slate-300">693086232188-abc123xyz.apps.googleusercontent.com</code>
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Google Client Secret (Chave Secreta)
                </label>
                <input
                  type="password"
                  value={inputClientSecret}
                  onChange={(e) => setInputClientSecret(e.target.value)}
                  placeholder="Cole o segredo do cliente aqui"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Developer Token Google Ads
                </label>
                <input
                  type="text"
                  value={inputDevToken}
                  onChange={(e) => setInputDevToken(e.target.value)}
                  placeholder="obopXETQW2Vmfba7OhvGQ"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowCredentialsModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCredentials}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all disabled:opacity-50"
                >
                  {isSavingCredentials ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Salvar Credenciais
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Google OAuth Authorization Notice & Fallback Link */}
      {showAuthUrlNotice && directAuthUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Autorização Google Ads</h3>
                  <p className="text-xs text-slate-400">Conecte sua conta do Google Ads oficial</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthUrlNotice(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl my-4 text-xs space-y-3 text-slate-300">
              <p>
                A janela de autorização do Google Ads foi preparada. Se o seu navegador bloqueou a janela pop-up, clique no botão abaixo para abrir diretamente:
              </p>
              <div>
                <a
                  href={directAuthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowAuthUrlNotice(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Tela de Autorização do Google Ads ↗
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>URI de retorno: <code>/auth/callback</code></span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(directAuthUrl);
                  showToast('info', 'Link copiado para a área de transferência!');
                }}
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3 h-3" />
                Copiar Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
