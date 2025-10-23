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
          🎉 Bem-vindo ao AI Coach PRO!
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Parabéns! Você agora tem acesso total às ferramentas de IA mais avançadas.
        </p>
        <p className="text-lg text-gray-500">
          Prepare-se para <strong>5x mais ganhos</strong> em <strong>4x menos tempo</strong>! 🚀
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-500 rounded-3xl p-8 mb-8 shadow-xl">
        <h2 className="text-2xl font-black text-green-700 mb-6 flex items-center justify-center gap-3">
          <Gift className="w-8 h-8" />
          Suas Novas Superpowers Desbloqueadas:
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-700">Pre-scores Automáticos</h3>
            </div>
            <p className="text-gray-700 text-sm">IA analisa vídeos e preenche as 4 notas (Hook, Retention, Clarity, CTA) em 3 segundos</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-pink-100 rounded-full p-2">
                <Brain className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-pink-700">Draft de Insights</h3>
            </div>
            <p className="text-gray-700 text-sm">Gera insights profissionais de 22-28 palavras prontos para usar ou personalizar</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-700">Validação Inteligente</h3>
            </div>
            <p className="text-gray-700 text-sm">Verifica coerência e detecta problemas, garantindo 95%+ de aprovação</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 rounded-full p-2">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-red-700">Limites 5x Maiores</h3>
            </div>
            <p className="text-gray-700 text-sm">50-100 avaliações diárias vs 10 no Free. Maximiza seus ganhos!</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
        <h3 className="text-2xl font-black mb-4 flex items-center justify-center gap-3">
          <Star className="w-8 h-8" />
          Impacto nos Seus Ganhos
        </h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-sm font-semibold mb-2 opacity-80">ANTES (FREE)</p>
            <p className="text-4xl font-black mb-2">200 pts/dia</p>
            <p className="text-sm opacity-90">10 avaliações × 20pts</p>
            <p className="text-xs mt-1 opacity-70">~120 minutos de trabalho</p>
          </div>
          <div className="text-center bg-white/20 backdrop-blur rounded-xl p-4">
            <p className="text-sm font-semibold mb-2">AGORA (PRO)</p>
            <p className="text-4xl font-black mb-2">1,000 pts/dia</p>
            <p className="text-sm">50 avaliações × 20pts</p>
            <p className="text-xs mt-1 opacity-90">~30 minutos de trabalho</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-xl font-black">🔥 5x MAIS GANHOS em 75% MENOS TEMPO!</p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-2xl font-black text-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 mb-6"
      >
        <Rocket className="inline w-6 h-6 mr-3" />
        Começar a Usar Agora!
      </button>

      <p className="text-gray-500 text-sm">
        Obrigado por apoiar o YouTube Rewards PRO!
      </p>
    </div>
  );
}