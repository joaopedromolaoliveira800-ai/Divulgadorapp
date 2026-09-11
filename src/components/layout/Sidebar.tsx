import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Megaphone,
  BarChart3,
  Sparkles,
  Link2,
  CreditCard,
  Settings,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { User, GoogleAdsStatus } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  googleAdsStatus: GoogleAdsStatus | null;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  googleAdsStatus,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const isConnected = googleAdsStatus?.isConnected;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-campaign', label: 'Criar campanha', icon: PlusCircle, highlight: true },
    { id: 'campaigns', label: 'Campanhas', icon: Megaphone },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'ai-studio', label: 'IA para Anúncios', icon: Sparkles },
    {
      id: 'integrations',
      label: 'Integrações',
      icon: Link2,
      badge: !isConnected ? 'Pendente' : 'Google Ads',
      badgeColor: !isConnected ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300',
    },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({
      id: 'admin',
      label: 'Painel Admin',
      icon: Shield,
      badge: 'Logs & API',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
    });
  }

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobileMenu();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/80 w-64 p-4">
      {/* Navigation List */}
      <div className="space-y-1.5 flex-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                  : item.highlight
                  ? 'text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-900/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-cyan-400' : item.highlight ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Integration Status Box */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-300">Google Ads API</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {isConnected
              ? 'Conectada via OAuth 2.0 oficial (v18)'
              : 'Integração pendente de conexão'}
          </p>
          {!isConnected && (
            <button
              onClick={() => handleItemClick('integrations')}
              className="mt-2.5 w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
            >
              Conectar Conta
            </button>
          )}
        </div>
      </div>

      {/* Slogan footnote */}
      <div className="mt-3 px-1 text-[11px] text-slate-400 text-center">
        DivulgadorAds • v1.0
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobileMenu}
          />
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
