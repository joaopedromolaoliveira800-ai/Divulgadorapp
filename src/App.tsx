import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { User, GoogleAdsStatus } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { CampaignsListView } from './views/CampaignsListView';
import { CampaignDetailView } from './views/CampaignDetailView';
import { NewCampaignWizard } from './views/NewCampaignWizard';
import { ReportsView } from './views/ReportsView';
import { AiStudioView } from './views/AiStudioView';
import { IntegrationsView } from './views/IntegrationsView';
import { PlansView } from './views/PlansView';
import { AdminView } from './views/AdminView';
import { SettingsView } from './views/SettingsView';
import { OAuthCallbackView } from './views/OAuthCallbackView';
import { Loader2 } from 'lucide-react';

export default function App() {
  // If this window is the OAuth callback popup
  if (window.location.pathname === '/auth/callback') {
    return <OAuthCallbackView />;
  }

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [googleAdsStatus, setGoogleAdsStatus] = useState<GoogleAdsStatus | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Fetch initial session & Google Ads status
  const initializeAppData = async () => {
    try {
      const [userRes, adsRes] = await Promise.allSettled([
        api.getMe(),
        api.getGoogleAdsStatus(),
      ]);

      if (userRes.status === 'fulfilled') {
        setUser(userRes.value.user);
      }
      if (adsRes.status === 'fulfilled') {
        setGoogleAdsStatus(adsRes.value);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeAppData();
  }, []);

  const handleRefreshStatus = async () => {
    try {
      const status = await api.getGoogleAdsStatus();
      setGoogleAdsStatus(status);
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
  };

  const handleSelectAccount = async (accountId: string) => {
    try {
      await api.selectAccount(accountId);
      await handleRefreshStatus();
    } catch (err: any) {
      alert(`Erro ao selecionar conta: ${err.message}`);
    }
  };

  const handleNavigate = (view: string, data?: any) => {
    if (view === 'campaign-detail' && data?.campaignId) {
      setSelectedCampaignId(data.campaignId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView('dashboard');
    handleRefreshStatus();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setCurrentView('landing');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-base font-bold text-white tracking-tight">DIVULGADORADS</h2>
        <p className="text-xs text-slate-400 mt-1">Carregando painel de publicidade oficial...</p>
      </div>
    );
  }

  // If user is on the public landing page
  if (currentView === 'landing' || (!user && currentView !== 'auth')) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar
          user={user}
          googleAdsStatus={googleAdsStatus}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onSelectAccount={handleSelectAccount}
        />
        <main className="flex-1">
          <LandingView onNavigate={handleNavigate} />
        </main>
      </div>
    );
  }

  // If user is on the Auth view
  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar
          user={user}
          googleAdsStatus={googleAdsStatus}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onSelectAccount={handleSelectAccount}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <AuthView onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />
        </main>
      </div>
    );
  }

  // Authenticated App Shell with Sidebar & Main Canvas
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        user={user}
        googleAdsStatus={googleAdsStatus}
        onNavigate={handleNavigate}
        currentView={currentView}
        onLogout={handleLogout}
        onSelectAccount={handleSelectAccount}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex">
        {/* Persistent Desktop Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          user={user}
          googleAdsStatus={googleAdsStatus}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              googleAdsStatus={googleAdsStatus}
              onNavigate={handleNavigate}
              onRefreshStatus={handleRefreshStatus}
            />
          )}

          {currentView === 'campaigns' && (
            <CampaignsListView
              googleAdsStatus={googleAdsStatus}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'campaign-detail' && selectedCampaignId && (
            <CampaignDetailView
              campaignId={selectedCampaignId}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'new-campaign' && (
            <NewCampaignWizard
              googleAdsStatus={googleAdsStatus}
              onNavigate={handleNavigate}
              onRefreshStatus={handleRefreshStatus}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              googleAdsStatus={googleAdsStatus}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'ai-studio' && (
            <AiStudioView onNavigate={handleNavigate} />
          )}

          {currentView === 'integrations' && (
            <IntegrationsView
              googleAdsStatus={googleAdsStatus}
              onRefreshStatus={handleRefreshStatus}
              onSelectAccount={handleSelectAccount}
            />
          )}

          {currentView === 'plans' && (
            <PlansView
              currentSubscription={user?.subscription}
              onRefreshUser={initializeAppData}
            />
          )}

          {currentView === 'admin' && <AdminView />}

          {currentView === 'settings' && (
            <SettingsView user={user} googleAdsStatus={googleAdsStatus} />
          )}
        </main>
      </div>
    </div>
  );
}
