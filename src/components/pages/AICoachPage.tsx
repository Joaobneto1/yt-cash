import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Zap, Target, TrendingUp, Brain, Rocket, Lock, CheckCircle, AlertCircle, Award, Clock, BarChart3 } from 'lucide-react';
import CoachPro from './CoachPro';

export default function AICoachPage() {
  const { userProfile } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro'>('free');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Detecta retorno do Stripe e carrega plano
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');

    if (status === 'success') {
      console.log('✅ Stripe payment success detected!');
      setCurrentPlan('pro');
      setShowWelcome(true); // Mostra boas-vindas quando vem do Stripe
      localStorage.setItem('user_plan', 'pro');
      
      // Limpa URL
      urlParams.delete('status');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    } else {
      // Carrega plano do perfil ou localStorage
      if (userProfile?.ia_upgrade && userProfile?.plan_status === 'active') {
        setCurrentPlan('pro');
        localStorage.setItem('user_plan', 'pro');
      } else {
        const savedPlan = localStorage.getItem('user_plan') as 'free' | 'pro';
        if (savedPlan === 'pro') {
          setCurrentPlan('pro');
        }
      }
    }
  }, [userProfile]);

  const hasAIAccess = currentPlan === 'pro' || 
    (userProfile?.ia_upgrade && userProfile?.plan_status === 'active');

  const handleUpgrade = () => {
    const stripeLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    if (stripeLink) {
      console.log('🚀 Redirecionando para Stripe PRO...');
      setIsUpgrading(true);
      window.location.assign(stripeLink);
    }
  };

  // Se tem acesso PRO mas quer mostrar boas-vindas
  if (hasAIAccess && showWelcome) {
    return <CoachPro onContinue={() => setShowWelcome(false)} />;
  }

  // Se não tem acesso, mostra paywall stripe
  if (!hasAIAccess) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
            AI Coach Pro
          </h1>
          <p className="text-xl text-gray-600 font-semibold">
            O Acelerador Definitivo do YouTube Rewards
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 border-4 border-purple-600 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-black text-purple-600">Desbloqueie o Poder da IA</h2>
          </div>

          <p className="text-lg text-gray-700 mb-8">
            O AI Coach transforma sua experiência no app, multiplicando sua velocidade, precisão e ganhos.
            Deixe a IA trabalhar para você!
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border-4 border-purple-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
                <h3 className="text-xl font-black text-purple-600">Avaliações Ultrarrápidas</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Pre-scores automáticos:</strong> IA analisa e sugere notas para Hook, Retention, Clarity e CTA instantaneamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Draft de insights:</strong> IA gera insights de 22-28 palavras prontos para usar ou editar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Economia de 70% do tempo:</strong> Complete avaliações em 30 segundos ao invés de 2 minutos</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-4 border-pink-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-pink-600" />
                <h3 className="text-xl font-black text-pink-600">Aprovação Máxima</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Validação de coerência:</strong> IA verifica se suas notas fazem sentido antes de enviar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Detecção de duplicatas:</strong> Evita insights repetidos automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Taxa de aprovação 95%+:</strong> Insights gerados pela IA têm aprovação quase garantida</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-4 border-red-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-black text-red-600">Ganhos Multiplicados</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>5x mais avaliações:</strong> Complete 50-100 avaliações por dia vs 10 no plano Free</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Sem rejeições desperdiçadas:</strong> Validação prévia elimina avaliações inválidas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>ROI comprovado:</strong> Recupere o investimento em 2-3 dias de uso ativo</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-4 border-blue-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-black text-blue-600">Aprendizado Contínuo</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Padrões de qualidade:</strong> IA aprende o que os moderadores aprovam</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Melhore suas habilidades:</strong> Veja como a IA avalia e aprenda técnicas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Relatórios de performance:</strong> Analytics detalhados do seu progresso</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
            <div className="text-center">
              <Award className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-3xl font-black mb-3">Comparação de Ganhos</h3>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                  <p className="text-sm font-semibold mb-2">PLANO FREE</p>
                  <p className="text-5xl font-black mb-2">200</p>
                  <p className="text-sm">pontos/dia (10 avaliações × 20pts)</p>
                  <p className="text-xs mt-2 opacity-80">~120 minutos de trabalho</p>
                </div>
                <div className="bg-white/30 backdrop-blur rounded-xl p-6 ring-4 ring-white/50">
                  <p className="text-sm font-semibold mb-2">PRO + AI COACH</p>
                  <p className="text-5xl font-black mb-2">1,000</p>
                  <p className="text-sm">pontos/dia (50 avaliações × 20pts)</p>
                  <p className="text-xs mt-2 opacity-80">~30 minutos de trabalho</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-2xl font-black">5x MAIS PONTOS em 4x MENOS TEMPO</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-6 rounded-2xl font-black text-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 border-4 border-white ${
                isUpgrading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isUpgrading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Processando...
                </span>
              ) : (
                <>
                  <Rocket className="inline w-8 h-8 mr-3" />
                  Desbloquear AI Coach Agora
                </>
              )}
            </button>
            <p className="text-gray-600 mt-4 text-sm">
              Plano PRO por apenas $33/mês
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se tem acesso e já passou da tela de boas-vindas, mostra as ferramentas
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-4 shadow-2xl animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-3">
          AI Coach Ativo
        </h1>
        <p className="text-xl text-gray-600 font-semibold">
          Seu Acelerador Pessoal Está Pronto
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-600 rounded-3xl p-8 shadow-2xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-black text-green-600">Status: Ativo e Pronto</h2>
          </div>
          <div className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
            PRO
          </div>
        </div>
        <p className="text-lg text-gray-700 mb-6">
          Todas as ferramentas de IA estão disponíveis. Use-as na página de Avaliação para acelerar seu trabalho!
        </p>
      </div>

      <h2 className="text-2xl font-black text-gray-800 mb-6">Ferramentas Disponíveis</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-4 border-purple-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-black text-purple-600">Pre-scores</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            IA analisa o vídeo e sugere notas de 0-10 para cada critério baseado em padrões de qualidade.
          </p>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-purple-600">DISPONÍVEL NA AVALIAÇÃO</p>
          </div>
        </div>

        <div className="bg-white border-4 border-pink-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-pink-100 rounded-full p-3">
              <Brain className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-black text-pink-600">Draft Insights</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Gera insights de 22-28 palavras com formato profissional: Problema → Mudança → Benefício.
          </p>
          <div className="bg-pink-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-pink-600">DISPONÍVEL NA AVALIAÇÃO</p>
          </div>
        </div>

        <div className="bg-white border-4 border-blue-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-black text-blue-600">Validação</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Verifica coerência entre notas e insight, detecta problemas e aumenta aprovação para 95%+.
          </p>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-600">SEMPRE ATIVO</p>
          </div>
        </div>

        <div className="bg-white border-4 border-green-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-black text-green-600">Velocidade 3x</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Complete avaliações em ~30 segundos. De 10 para 50+ avaliações diárias sem esforço extra.
          </p>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-600">SEMPRE ATIVO</p>
          </div>
        </div>

        <div className="bg-white border-4 border-orange-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 rounded-full p-3">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-black text-orange-600">Analytics</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Relatórios detalhados de performance, tendências de aprovação e sugestões de melhoria.
          </p>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-600">EM BREVE</p>
          </div>
        </div>

        <div className="bg-white border-4 border-red-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-red-600">Limites 5x</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            50-100 avaliações diárias (vs 10 Free). 250-700 semanais. Maximize seus ganhos.
          </p>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-600">SEMPRE ATIVO</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-500 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
          <h2 className="text-2xl font-black text-yellow-600">Como Usar o AI Coach</h2>
        </div>
        <ol className="space-y-4 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
            <div>
              <p className="font-bold mb-1">Vá para a página "Evaluate"</p>
              <p className="text-sm">Escolha um vídeo da biblioteca e clique em "Evaluate"</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
            <div>
              <p className="font-bold mb-1">Use o botão "Generate Pre-scores"</p>
              <p className="text-sm">A IA analisa e preenche as 4 notas automaticamente em 3 segundos</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
            <div>
              <p className="font-bold mb-1">Use o botão "Draft Insight"</p>
              <p className="text-sm">A IA gera um insight profissional pronto para usar ou editar</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
            <div>
              <p className="font-bold mb-1">Revise e ajuste se necessário</p>
              <p className="text-sm">Faça pequenos ajustes se quiser personalizar (opcional)</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
            <div>
              <p className="font-bold mb-1">Submit e ganhe seus pontos!</p>
              <p className="text-sm">A validação automática garante aprovação quase certa</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
