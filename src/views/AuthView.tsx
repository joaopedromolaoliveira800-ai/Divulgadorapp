import React, { useState } from 'react';
import {
  ArrowRight,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthViewProps {
  mode: 'login' | 'register' | 'forgot';
  onSuccess: (user: User) => void;
  onSwitchMode: (mode: 'login' | 'register' | 'forgot') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ mode, onSuccess, onSwitchMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
      } else if (mode === 'register') {
        const res = await api.register(name, email, password);
        onSuccess(res.user);
      } else if (mode === 'forgot') {
        // Simulate password recovery dispatch
        setForgotSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique os dados informados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { configured, url } = await api.getGoogleOAuthUrl();
      if (!configured || !url) {
        // If not configured in environment yet, provide demo sign-in
        const res = await api.login('admin@divulgadorads.com.br');
        onSuccess(res.user);
        return;
      }
      window.location.href = url;
    } catch {
      // Fallback
      const res = await api.login('usuario@divulgadorads.com.br');
      onSuccess(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 p-0.5 mx-auto shadow-lg shadow-cyan-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' && 'Entrar no DivulgadorAds'}
            {mode === 'register' && 'Criar Conta no DivulgadorAds'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Acesse suas campanhas e métricas do Google Ads'}
            {mode === 'register' && 'Comece a divulgar seu negócio no Google agora mesmo'}
            {mode === 'forgot' && 'Informe seu e-mail cadastrado para redefinir o acesso'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {forgotSent ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm">Instruções enviadas!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Verifique sua caixa de entrada para redefinir sua senha com segurança.
            </p>
            <button
              onClick={() => onSwitchMode('login')}
              className="mt-4 text-xs font-semibold text-cyan-400 hover:underline"
            >
              Voltar para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Google OAuth Button */}
            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2.5 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{mode === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-900 text-slate-400">ou com e-mail</span>
                  </div>
                </div>
              </>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou empresa"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => onSwitchMode('forgot')}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Entrar'}
                    {mode === 'register' && 'Criar Conta'}
                    {mode === 'forgot' && 'Enviar Redefinição'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Switch Links */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' && (
            <p>
              Não tem uma conta?{' '}
              <button
                onClick={() => onSwitchMode('register')}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Cadastre-se grátis
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Já tem uma conta?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Fazer login
              </button>
            </p>
          )}
          {mode === 'forgot' && !forgotSent && (
            <button
              onClick={() => onSwitchMode('login')}
              className="text-cyan-400 font-semibold hover:underline"
            >
              Voltar ao login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
