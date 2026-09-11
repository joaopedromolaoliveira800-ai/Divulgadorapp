import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  ChevronDown,
  Check,
  LogOut,
  User as UserIcon,
  Shield,
  Zap,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { User, GoogleAdsAccount, GoogleAdsStatus } from '../../types';

interface NavbarProps {
  user: User | null;
  googleAdsStatus: GoogleAdsStatus | null;
  onSelectAccount: (accountId: string) => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  googleAdsStatus,
  onSelectAccount,
  onNavigate,
  currentView,
  onLogout,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const selectedAccount = googleAdsStatus?.selectedAccount;
  const accounts = googleAdsStatus?.accounts || [];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Custom Brand Logo Mark: DivulgadorAds geometric megaphone & beam */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-tr from-cyan-400 to-indigo-400 rounded-sm transform rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Divulgador<span className="text-cyan-400 font-black">Ads</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">
                Alcance mais clientes
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Google Ads Account Selector and Quick Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Active Google Ads Account Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  selectedAccount
                    ? 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-cyan-500/50'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    selectedAccount ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="max-w-[140px] sm:max-w-[180px] truncate">
                  {selectedAccount ? selectedAccount.descriptiveName : 'Sem Conta Selecionada'}
                </span>
                {selectedAccount && (
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    ({selectedAccount.customerId})
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Account Dropdown */}
              {isAccountDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsAccountDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="text-xs font-semibold text-slate-300">Contas Google Ads</div>
                    <div className="text-[11px] text-slate-400">
                      {accounts.length > 0
                        ? `${accounts.length} conta(s) vinculada(s)`
                        : 'Nenhuma conta detectada'}
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {accounts.length > 0 ? (
                      accounts.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            onSelectAccount(acc.id);
                            setIsAccountDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 text-xs transition-colors ${
                            acc.id === selectedAccount?.id ? 'bg-cyan-500/10 text-cyan-300 font-medium' : 'text-slate-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-semibold truncate">{acc.descriptiveName}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                              <span>{acc.customerId}</span>
                              {acc.isTestAccount && (
                                <span className="text-amber-400 bg-amber-400/10 px-1 rounded">Teste</span>
                              )}
                            </div>
                          </div>
                          {acc.id === selectedAccount?.id && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-xs text-slate-400">
                        <p>Nenhuma conta conectada.</p>
                        <button
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            onNavigate('integrations');
                          }}
                          className="mt-2 text-cyan-400 hover:underline font-semibold"
                        >
                          Conectar Google Ads agora
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-800 p-2">
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        onNavigate('integrations');
                      }}
                      className="w-full text-center py-1.5 text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Gerenciar Contas & Integração
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action: Criar Campanha */}
            <button
              onClick={() => onNavigate('new-campaign')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Criar Campanha
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    {user.role === 'ADMIN' && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold">
                        Administrador
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Configurações & Chaves
                    </button>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigate('plans');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Planos & Assinatura
                    </button>
                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        Painel de Controle Admin
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Public Navigation Links */
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('plans')}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5"
            >
              Planos
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
            >
              Começar agora
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
