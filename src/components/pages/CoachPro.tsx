import { Zap, Target, TrendingUp, Brain, Rocket, Star, Gift, Trophy } from 'lucide-react';

interface CoachProProps {  
  onContinue: () => void;
}

export default function CoachPro({ onContinue }: CoachProProps) {  
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-6 shadow-2xl animate-bounce">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4">
          🎉 Welcome to AI Coach PRO!
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Congratulations! You now have full access to the most advanced AI tools.
        </p>
        <p className="text-lg text-gray-500">
          Get ready for <strong>5x more earnings</strong> in <strong>4x less time</strong>! 🚀
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-500 rounded-3xl p-8 mb-8 shadow-xl">
        <h2 className="text-2xl font-black text-green-700 mb-6 flex items-center justify-center gap-3">
          <Gift className="w-8 h-8" />
          Your New Superpowers Unlocked:
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-700">Automatic Pre-scores</h3>
            </div>
            <p className="text-gray-700 text-sm">AI analyzes videos and fills in the 4 scores (Hook, Retention, Clarity, CTA) in 3 seconds</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-pink-100 rounded-full p-2">
                <Brain className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-pink-700">Draft Insights</h3>
            </div>
            <p className="text-gray-700 text-sm">Generates professional 22-28 word insights ready to use or customize</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-700">Smart Validation</h3>
            </div>
            <p className="text-gray-700 text-sm">Checks coherence and detects issues, ensuring 95%+ approval rate</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 rounded-full p-2">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-red-700">5x Higher Limits</h3>
            </div>
            <p className="text-gray-700 text-sm">50-100 daily evaluations vs 10 on Free. Maximize your earnings!</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
        <h3 className="text-2xl font-black mb-4 flex items-center justify-center gap-3">
          <Star className="w-8 h-8" />
          Impact on Your Earnings
        </h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-sm font-semibold mb-2 opacity-80">BEFORE (FREE)</p>
            <p className="text-4xl font-black mb-2">200 pts/day</p>
            <p className="text-sm opacity-90">10 evaluations × 20pts</p>
            <p className="text-xs mt-1 opacity-70">~120 minutes of work</p>
          </div>
          <div className="text-center bg-white/20 backdrop-blur rounded-xl p-4">
            <p className="text-sm font-semibold mb-2">NOW (PRO)</p>
            <p className="text-4xl font-black mb-2">1,000 pts/day</p>
            <p className="text-sm">50 evaluations × 20pts</p>
            <p className="text-xs mt-1 opacity-90">~30 minutes of work</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-xl font-black">🔥 5x MORE EARNINGS in 75% LESS TIME!</p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-2xl font-black text-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 mb-6"
      >
        <Rocket className="inline w-6 h-6 mr-3" />
        Start Using Now!
      </button>

      <p className="text-gray-500 text-sm">
        Thank you for supporting YouTube Rewards PRO!
      </p>
    </div>
  );
}