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
            The Ultimate YouTube Rewards Accelerator
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 border-4 border-purple-600 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-black text-purple-600">Unlock the Power of AI</h2>
          </div>

          <p className="text-lg text-gray-700 mb-8">
            AI Coach transforms your app experience, multiplying your speed, accuracy and earnings.
            Let AI work for you!
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border-4 border-purple-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
                <h3 className="text-xl font-black text-purple-600">Ultra-Fast Evaluations</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Automatic pre-scores:</strong> AI analyzes and suggests scores for Hook, Retention, Clarity and CTA instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Draft insights:</strong> AI generates 22-28 word insights ready to use or edit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>70% time savings:</strong> Complete evaluations in 30 seconds instead of 2 minutes</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-4 border-pink-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-pink-600" />
                <h3 className="text-xl font-black text-pink-600">Maximum Approval</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Coherence validation:</strong> AI checks if your scores make sense before submitting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Duplicate detection:</strong> Automatically avoids repeated insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>95%+ approval rate:</strong> AI-generated insights have almost guaranteed approval</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-4 border-red-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-black text-red-600">Multiplied Earnings</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>5x more evaluations:</strong> Complete 50-100 evaluations per day vs 10 on Free plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>No wasted rejections:</strong> Prior validation eliminates invalid evaluations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Proven ROI:</strong> Recover your investment in 2-3 days of active use</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border-4 border-blue-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-black text-blue-600">Continuous Learning</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Quality patterns:</strong> AI learns what moderators approve</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Improve your skills:</strong> See how AI evaluates and learn techniques</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Performance reports:</strong> Detailed analytics of your progress</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
            <div className="text-center">
              <Award className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-3xl font-black mb-3">Earnings Comparison</h3>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                  <p className="text-sm font-semibold mb-2">FREE PLAN</p>
                  <p className="text-5xl font-black mb-2">200</p>
                  <p className="text-sm">points/day (10 evaluations × 20pts)</p>
                  <p className="text-xs mt-2 opacity-80">~120 minutes of work</p>
                </div>
                <div className="bg-white/30 backdrop-blur rounded-xl p-6 ring-4 ring-white/50">
                  <p className="text-sm font-semibold mb-2">PRO + AI COACH</p>
                  <p className="text-5xl font-black mb-2">1,000</p>
                  <p className="text-sm">points/day (50 evaluations × 20pts)</p>
                  <p className="text-xs mt-2 opacity-80">~30 minutes of work</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-2xl font-black">5x MORE POINTS in 4x LESS TIME</p>
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
                  Processing...
                </span>
              ) : (
                <>
                  <Rocket className="inline w-8 h-8 mr-3" />
                  Unlock AI Coach Now
                </>
              )}
            </button>
            <p className="text-gray-600 mt-4 text-sm">
              PRO Plan for only $33/month
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
          AI Coach Active
        </h1>
        <p className="text-xl text-gray-600 font-semibold">
          Your Personal Accelerator is Ready
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-600 rounded-3xl p-8 shadow-2xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-black text-green-600">Status: Active and Ready</h2>
          </div>
          <div className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
            PRO
          </div>
        </div>
        <p className="text-lg text-gray-700 mb-6">
          All AI tools are available. Use them on the Evaluation page to accelerate your work!
        </p>
      </div>

      <h2 className="text-2xl font-black text-gray-800 mb-6">Available Tools</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-4 border-purple-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-black text-purple-600">Pre-scores</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            AI analyzes the video and suggests 0-10 scores for each criterion based on quality patterns.
          </p>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-purple-600">AVAILABLE IN EVALUATION</p>
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
            Generates 22-28 word insights with professional format: Problem → Change → Benefit.
          </p>
          <div className="bg-pink-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-pink-600">AVAILABLE IN EVALUATION</p>
          </div>
        </div>

        <div className="bg-white border-4 border-blue-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-black text-blue-600">Validation</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Checks coherence between scores and insight, detects issues and increases approval to 95%+.
          </p>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-600">ALWAYS ACTIVE</p>
          </div>
        </div>

        <div className="bg-white border-4 border-green-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-black text-green-600">3x Speed</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Complete evaluations in ~30 seconds. From 10 to 50+ daily evaluations without extra effort.
          </p>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-600">ALWAYS ACTIVE</p>
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
            Detailed performance reports, approval trends and improvement suggestions.
          </p>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-600">COMING SOON</p>
          </div>
        </div>

        <div className="bg-white border-4 border-red-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-red-600">5x Limits</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            50-100 daily evaluations (vs 10 Free). 250-700 weekly. Maximize your earnings.
          </p>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-600">ALWAYS ACTIVE</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-500 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
          <h2 className="text-2xl font-black text-yellow-600">How to Use AI Coach</h2>
        </div>
        <ol className="space-y-4 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
            <div>
              <p className="font-bold mb-1">Go to the "Evaluate" page</p>
              <p className="text-sm">Choose a video from the library and click "Evaluate"</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
            <div>
              <p className="font-bold mb-1">Use the "Generate Pre-scores" button</p>
              <p className="text-sm">AI analyzes and fills in the 4 scores automatically in 3 seconds</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
            <div>
              <p className="font-bold mb-1">Use the "Draft Insight" button</p>
              <p className="text-sm">AI generates a professional insight ready to use or edit</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
            <div>
              <p className="font-bold mb-1">Review and adjust if needed</p>
              <p className="text-sm">Make small adjustments if you want to personalize (optional)</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</span>
            <div>
              <p className="font-bold mb-1">Submit and earn your points!</p>
              <p className="text-sm">Automatic validation ensures almost certain approval</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
