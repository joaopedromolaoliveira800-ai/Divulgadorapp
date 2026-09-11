import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  ShieldCheck,
  Search,
  Sliders,
  DollarSign,
  Layers,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  Globe,
  Smartphone,
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (view: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'O que é o DivulgadorAds?',
      a: 'O DivulgadorAds é uma plataforma SaaS criada para simplificar a criação e a gestão de campanhas de publicidade no Google Ads, eliminando a complexidade do painel nativo do Google através de automação inteligente e IA.',
    },
    {
      q: 'Como funciona a integração oficial com o Google Ads?',
      a: 'Nós utilizamos a Google Ads API oficial (v18) com autorização OAuth 2.0 segura. O DivulgadorAds nunca pede sua senha do Google e nunca armazena senhas. Você autoriza a conexão diretamente no ambiente do Google.',
    },
    {
      q: 'O orçamento dos anúncios está incluído na mensalidade do DivulgadorAds?',
      a: 'Não. A assinatura do DivulgadorAds é referente à plataforma e suas ferramentas de IA. O dinheiro destinado à veiculação dos anúncios continua sendo administrado e cobrado diretamente pela sua conta do Google Ads.',
    },
    {
      q: 'As campanhas são publicadas automaticamente?',
      a: 'Sim, mas por segurança nossa plataforma cria as campanhas inicialmente como PAUSADAS (PAUSED). Dessa forma você confere tudo antes de ativar com um simples clique no botão "Ativar campanha".',
    },
    {
      q: 'A IA faz promessas milagrosas de vendas?',
      a: 'Não. Nossa IA foi programada com foco estrito nas Políticas Oficiais de Publicidade do Google, gerando títulos e descrições éticos, persuasivos e sem promessas enganosas (como "primeiro lugar garantido").',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/15 to-violet-500/10 blur-[130px] -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Integrado à Google Ads API Oficial
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Divulgador<span className="text-cyan-400">Ads</span>
            <br />
            <span className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent text-3xl sm:text-5xl md:text-6xl font-extrabold block mt-2">
              Divulgue seu negócio no Google de forma simples.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Crie, gerencie e acompanhe suas campanhas de publicidade em um único painel.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group"
            >
              Começar agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 font-semibold text-sm hover:text-white hover:bg-slate-800 transition-colors"
            >
              Entrar
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sem complicação técnica
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Publicação real via API Oficial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Anúncios e Palavras com IA
            </span>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-2 sm:p-3 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-sm">
            <div className="bg-slate-950 rounded-xl p-4 sm:p-6 border border-slate-800/60">
              {/* Header simulation */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Olá, seja bem-vindo ao DivulgadorAds.</h3>
                  <p className="text-xs text-slate-400">Visão geral da sua conta Google Ads em tempo real</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  API Google Ads Ativa
                </span>
              </div>

              {/* Sample Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Investimento</div>
                  <div className="text-xl font-extrabold text-white mt-1">R$ 1.420,00</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">30 dias</div>
                </div>
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Impressões</div>
                  <div className="text-xl font-extrabold text-white mt-1">38.450</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">Exibições reais</div>
                </div>
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Cliques</div>
                  <div className="text-xl font-extrabold text-white mt-1">2.140</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">CTR 5,56%</div>
                </div>
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400 font-medium">Conversões</div>
                  <div className="text-xl font-extrabold text-white mt-1">142</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">CPA R$ 10,00</div>
                </div>
              </div>

              {/* Simulated Campaign Row */}
              <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">DivulgadorAds - Automação de WhatsApp</div>
                    <div className="text-[11px] text-slate-400">Orçamento: R$ 35,00/dia • Brasil</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                    Ativa
                  </span>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Acessar Painel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: COMO FUNCIONA */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Passo a Passo</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Como funciona o DivulgadorAds
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              Três passos simples para colocar seu negócio na primeira página do Google sem complicação técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Conecte sua conta Google Ads</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Utilize o OAuth 2.0 oficial do Google para vincular sua conta em segundos. Nós localizamos suas contas ativas e você escolhe onde anunciar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Crie com o Wizard e IA</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Informe o objetivo, nome, site e orçamento diário. Nossa IA especializada gera títulos de até 30 caracteres, descrições e palavras-chave de alta relevância.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Publique e Acompanhe</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Revise os dados e publique direto na Google Ads API oficial. Acompanhe métricas reais de cliques, impressões e conversões em um dashboard cristalino.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: RECURSOS */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Recursos Poderosos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Tudo o que você precisa para dominar o Google Ads
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <Zap className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-bold text-white text-base mb-1.5">Google Ads API Oficial</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Integração direta com endpoints v18 da Google Ads API. Nunca simulamos campanhas nem inventamos métricas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <Sparkles className="w-6 h-6 text-indigo-400 mb-3" />
              <h3 className="font-bold text-white text-base mb-1.5">IA para Anúncios (Gemini)</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Crie de 8 a 15 variações de títulos e descrições otimizados no padrão Responsive Search Ad sem bloqueios de política.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <Sliders className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white text-base mb-1.5">Controle de Orçamento</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Defina quanto quer investir por dia e veja a estimativa mensal exata calculada antes de confirmar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <Search className="w-6 h-6 text-violet-400 mb-3" />
              <h3 className="font-bold text-white text-base mb-1.5">Palavras Negativas</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Filtre buscas desqualificadas (como "grátis", "pdf", "reclamação") para economizar seu orçamento de mídia.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <BarChart3 className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-bold text-white text-base mb-1.5">Relatórios & Exportação CSV</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Filtros de Hoje, 7 dias, 30 dias e 90 dias com gráficos e exportação pronta para reuniões e clientes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-teal-400 mb-3" />
              <h3 className="font-bold text-white text-base mb-1.5">Publicação com Segurança</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Suas campanhas são criadas inicialmente como PAUSADAS para verificação, com ativação imediata com 1 clique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: PLANOS */}
      <section className="py-20 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Planos Transparentes</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Escolha o plano ideal para seu negócio
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              * Importante: A assinatura do DivulgadorAds é separada do seu orçamento de publicidade. O dinheiro destinado à publicidade continua sendo administrado diretamente pelo Google Ads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Grátis */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Iniciante</span>
                <h3 className="text-2xl font-black text-white mt-1">Grátis</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">R$ 0</span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Perfeito para dar os primeiros passos e publicar campanhas no Google Ads.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    1 conta Google Ads vinculada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Até 2 campanhas ativas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Dashboard essencial com métricas reais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Publicação oficial via Google Ads API
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('register')}
                className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Começar Grátis
              </button>
            </div>

            {/* Pro */}
            <div className="p-7 rounded-2xl bg-slate-900 border-2 border-cyan-500 flex flex-col justify-between relative shadow-xl shadow-cyan-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[11px] uppercase tracking-wide">
                Mais Popular
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Crescimento</span>
                <h3 className="text-2xl font-black text-white mt-1">Pro</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">R$ 79</span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Para empresas que querem acelerar resultados e usar inteligência artificial.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    Até 3 contas Google Ads
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    Até 15 campanhas ativas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    IA do DivulgadorAds para anúncios e palavras
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    Relatórios avançados com exportação CSV
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    Suporte prioritário
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('register')}
                className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-500/20"
              >
                Assinar Plano Pro
              </button>
            </div>

            {/* Agência */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Agências & Gestores</span>
                <h3 className="text-2xl font-black text-white mt-1">Agência</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">R$ 199</span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Para agências, consultores e gestores que cuidam de múltiplos clientes.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Múltiplas contas de clientes ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Campanhas ilimitadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    IA ilimitada para copy e palavras
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Painel multi-cliente e logs de API
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Gerente de conta dedicado
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('register')}
                className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Assinar Agência
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: FAQ */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Tire Suas Dúvidas</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              D
            </div>
            <span className="font-bold text-slate-200">DivulgadorAds</span>
            <span>— Divulgue seu negócio. Alcance mais clientes.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('plans')} className="hover:text-slate-200">Planos</button>
            <button onClick={() => onNavigate('login')} className="hover:text-slate-200">Entrar</button>
            <button onClick={() => onNavigate('register')} className="hover:text-slate-200">Criar Conta</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
