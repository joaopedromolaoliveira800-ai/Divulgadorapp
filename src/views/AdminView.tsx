import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Layers,
  Megaphone,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Lock,
  Crown,
  UserCheck,
  UserX,
  Plus,
  Mail,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { ApiLog, User, Plan } from '../types';

export const AdminView: React.FC = () => {
  const [data, setData] = useState<{
    stats: any;
    logs: ApiLog[];
    users: User[];
    plans: Plan[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  // Promote user state
  const [promoteEmail, setPromoteEmail] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [promoteMessage, setPromoteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    setIsPromoting(true);
    setPromoteMessage(null);
    try {
      const res = await api.promoteUserByEmail(promoteEmail.trim(), 'ADMIN');
      setPromoteMessage({
        type: 'success',
        text: `Usuário ${res.user.email} promovido para Administrador com sucesso!`,
      });
      setPromoteEmail('');
      loadAdminData();
    } catch (err: any) {
      setPromoteMessage({
        type: 'error',
        text: err.message || 'Erro ao conceder privilégios de administrador.',
      });
    } finally {
      setIsPromoting(false);
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setRoleUpdatingId(user.id);
    try {
      await api.updateUserRole(user.id, newRole);
      loadAdminData();
    } catch (err: any) {
      alert(`Falha ao alterar papel do usuário: ${err.message}`);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const stats = data?.stats;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            Painel do Administrador Master
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Auditoria & Sistema DivulgadorAds
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoramento de administradores, chamadas à Google Ads API e integridade da infraestrutura.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Security Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>Conformidade e Segurança:</strong> Nenhum token de acesso (OAuth Token ou Client Secret) é transmitido para o navegador. Todas as chamadas ao Google Ads ocorrem exclusivamente no backend.
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Usuários Totais</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Contas Conectadas</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{stats.totalConnectedAccounts}</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Campanhas Criadas</span>
              <Megaphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalCampaigns}
              <span className="text-xs font-normal text-slate-400 ml-2">
                ({stats.activeCampaigns} ativas / {stats.pausedCampaigns} pausadas)
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Requisições Google Ads</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {stats.totalApiLogs}
              <span className="text-xs font-normal text-rose-400 ml-2">
                ({stats.apiErrorsCount} falhas)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários & Administradores ({data?.users?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'logs'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Logs de Auditoria Google Ads ({data?.logs?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: USERS & ADMINS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Promote Form */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Conceder Acesso de Administrador</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Defina novos administradores no sistema. Eles terão acesso a este painel e permissões totais de gestão.
            </p>

            <form onSubmit={handlePromoteUser} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="exemplo: novo.admin@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isPromoting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 shrink-0"
              >
                {isPromoting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Conceder Admin</span>
                  </>
                )}
              </button>
            </form>

            {promoteMessage && (
              <div
                className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  promoteMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {promoteMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{promoteMessage.text}</span>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Contas Cadastradas no DivulgadorAds
                </h3>
                <p className="text-xs text-slate-400">
                  Gerenciamento de papéis de usuário e controle de permissões.
                </p>
              </div>
            </div>

            {data?.users && data.users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Usuário</th>
                      <th className="px-4 py-3">E-mail</th>
                      <th className="px-4 py-3">Função</th>
                      <th className="px-4 py-3">ID do Sistema</th>
                      <th className="px-4 py-3">Data de Cadastro</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {data.users.map((u) => {
                      const isMasterAdmin = u.email.toLowerCase() === 'joaopedromolaoliveira800@gmail.com';
                      const isAdmin = u.role === 'ADMIN';

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isMasterAdmin ? 'bg-cyan-950/15' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isAdmin
                                    ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {isAdmin ? <Crown className="w-3.5 h-3.5" /> : u.name?.[0] || 'U'}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-200 block">{u.name}</span>
                                {isMasterAdmin && (
                                  <span className="text-[10px] text-cyan-400 font-semibold tracking-wide">
                                    Admin Master Configurado
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono text-xs text-slate-300">
                            {u.email}
                          </td>

                          <td className="px-4 py-3">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                                <Shield className="w-3 h-3" />
                                ADMIN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                                USUÁRIO
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                            {u.id}
                          </td>

                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {isMasterAdmin ? (
                              <span className="text-[11px] text-slate-500 italic">
                                Protegido (Master)
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleRole(u)}
                                disabled={roleUpdatingId === u.id}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto ${
                                  isAdmin
                                    ? 'bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 hover:border-rose-800 border border-slate-700'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {roleUpdatingId === u.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : isAdmin ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Tornar Usuário</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Promover a Admin</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum usuário cadastrado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS TABLE */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Logs de Auditoria da Google Ads API (Últimas 50 operações)
              </h3>
              <p className="text-xs text-slate-400">
                Rastreamento de latência, códigos de status e IDs de transação do Google.
              </p>
            </div>
          </div>

          {data?.logs && data.logs.length > 0 ? (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Operação</th>
                    <th className="px-4 py-3">Endpoint</th>
                    <th className="px-4 py-3">Request ID Google</th>
                    <th className="px-4 py-3">Horário</th>
                    <th className="px-4 py-3 text-right">Detalhe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {data.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 text-xs">
                      <td className="px-4 py-3 font-mono">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {log.statusCode}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {log.statusCode}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{log.operation}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                        {log.endpoint}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-cyan-400">
                        {log.requestId || '—'}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum log registrado até o momento.
            </div>
          )}
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Detalhes da Requisição Google Ads</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="py-4 space-y-3 overflow-y-auto text-xs font-mono flex-1">
              <div>
                <span className="text-slate-500">Operação:</span>{' '}
                <span className="text-white font-bold">{selectedLog.operation}</span>
              </div>
              <div>
                <span className="text-slate-500">Endpoint:</span>{' '}
                <span className="text-cyan-400">{selectedLog.endpoint}</span>
              </div>
              <div>
                <span className="text-slate-500">Google Request ID:</span>{' '}
                <span className="text-amber-400">{selectedLog.requestId || 'N/A'}</span>
              </div>

              {selectedLog.errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
                  <div className="font-bold">Mensagem de Erro:</div>
                  <pre className="whitespace-pre-wrap mt-1 text-[11px]">{selectedLog.errorMessage}</pre>
                </div>
              )}

              {selectedLog.responsePayload && (
                <div>
                  <span className="text-slate-500 block mb-1">Payload de Resposta:</span>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-60">
                    {selectedLog.responsePayload}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
