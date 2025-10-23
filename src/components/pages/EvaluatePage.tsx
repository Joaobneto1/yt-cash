import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Play, Send, AlertCircle, Lock, Sparkles, Zap, Brain } from 'lucide-react';

interface Video {
  id: string;
  source_url: string;
  thumb_url: string | null;
  duration_seconds: number;
  topic: string | null;
}

const PLANS = {
  free: { daily_quota: 10, weekly_quota: 40, ai_coach: false, price_text: 'Free' },
  pro: { daily_quota: 50, weekly_quota: 250, ai_coach: true, price_text: '$9/mo' },
  pro_plus: { daily_quota: 100, weekly_quota: 700, ai_coach: true, price_text: '$19/mo' },
};

export default function EvaluatePage() {
  const { userProfile, refreshProfile } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [scores, setScores] = useState({
    hook: 5,
    retention: 5,
    clarity: 5,
    cta: 5,
  });
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paywall, setPaywall] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const checkQuota = () => {
    if (!userProfile) return false;

    const planKey = userProfile.plan_tier as keyof typeof PLANS;
    const plan = PLANS[planKey] || PLANS.free;
    const dailyUsed = userProfile.daily_quota_used || 0;
    const weeklyUsed = userProfile.weekly_quota_used || 0;

    if (dailyUsed >= plan.daily_quota || weeklyUsed >= plan.weekly_quota) {
      setPaywall(true);
      setPaywallMessage(
        `You've reached your ${userProfile.plan_tier.toUpperCase()} limit (${dailyUsed}/${plan.daily_quota} daily, ${weeklyUsed}/${plan.weekly_quota} weekly). Upgrade to PRO for higher limits!`
      );
      return false;
    }

    return true;
  };

  const startEvaluation = async (video: Video) => {
    if (!userProfile?.id) return;

    if (!checkQuota()) return;

    try {
      setLoading(true);
      setError('');
      setPaywall(false);

      const { data: session, error: sessionError } = await (supabase
        .from('evaluation_sessions') as any)
        .insert({
          user_id: userProfile.id,
          video_id: video.id,
          watch_time_seconds: 0,
          started_at: new Date().toISOString(),
          status: 'draft',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(session.id);
      setCurrentVideo(video);
      setWatchTime(0);
      setScores({ hook: 5, retention: 5, clarity: 5, cta: 5 });
      setInsight('');
    } catch (err: any) {
      setError(err.message || 'Failed to start evaluation');
    } finally {
      setLoading(false);
    }
  };

  const submitEvaluation = async () => {
    if (!sessionId || !userProfile?.id || !currentVideo) return;

    if (watchTime < 20) {
      setError('You must watch at least 20 seconds of the video');
      return;
    }

    if (!insight.trim()) {
      setError('Please provide an insight');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error: evalError } = await (supabase.from('evaluations') as any).insert({
        session_id: sessionId,
        score_hook: scores.hook,
        score_retention: scores.retention,
        score_clarity: scores.clarity,
        score_cta: scores.cta,
        insight_text: insight,
        insight_hash: btoa(insight.toLowerCase().trim()),
        valid: true,
        reason_invalid: 'none',
      });

      if (evalError) throw evalError;

      const elapsedSeconds = Math.floor((new Date().getTime() - new Date().getTime()) / 1000);

      const { error: sessionError } = await (supabase
        .from('evaluation_sessions') as any)
        .update({
          submitted_at: new Date().toISOString(),
          elapsed_seconds: elapsedSeconds,
          status: 'validated',
          watch_time_seconds: watchTime,
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      const { error: ledgerError } = await (supabase.from('points_ledger') as any).insert({
        user_id: userProfile.id,
        type: 'evaluation_reward',
        ref_id: sessionId,
        points: 20,
        note: 'Valid evaluation completed',
      });

      if (ledgerError) throw ledgerError;

      const { error: userError } = await (supabase
        .from('users') as any)
        .update({
          daily_quota_used: (userProfile.daily_quota_used || 0) + 1,
          weekly_quota_used: (userProfile.weekly_quota_used || 0) + 1,
        })
        .eq('id', userProfile.id);

      if (userError) throw userError;

      alert('Evaluation submitted! +20 points earned');
      setCurrentVideo(null);
      setSessionId(null);
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to submit evaluation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentVideo) return;

    const interval = setInterval(() => {
      setWatchTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentVideo]);

  if (paywall) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-4 border-red-600 rounded-2xl p-8 shadow-xl text-center">
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-red-600 mb-4">Quota Limit Reached</h2>
          <p className="text-gray-700 mb-6">{paywallMessage}</p>
          <div className="space-y-3">
            <button className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700">
              Upgrade to PRO
            </button>
            <button
              onClick={() => setPaywall(false)}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentVideo) {
    const hasAIAccess = userProfile?.ia_upgrade && userProfile?.plan_status === 'active';

    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-red-600 mb-6">Evaluate Video</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white border-4 border-red-600 rounded-2xl p-6 shadow-xl">
              <div className="aspect-video bg-gray-900 rounded-xl mb-4 flex items-center justify-center">
                <Play className="w-16 h-16 text-white" />
                <p className="text-white ml-4">Video Player: {currentVideo.topic || 'Video'}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-semibold">Watch time: {watchTime}s</span>
                <span className="text-gray-600 font-semibold">
                  Duration: {currentVideo.duration_seconds}s
                </span>
              </div>
            </div>

            {hasAIAccess && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-500 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-green-600 rounded-full p-2 animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-green-600">AI Coach Ativo</h3>
                    <p className="text-xs text-green-700 font-semibold">Acelerador PRO Disponível</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  Use as ferramentas abaixo para completar esta avaliação em 30 segundos:
                </p>
                <div className="space-y-2">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Gerar Pre-scores (3s)
                  </button>
                  <button className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3 rounded-xl font-bold hover:from-pink-700 hover:to-pink-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                    <Brain className="w-5 h-5" />
                    Criar Insight Automático
                  </button>
                </div>
                <div className="mt-4 bg-white/50 rounded-lg p-3 border-2 border-green-300">
                  <p className="text-xs text-gray-600 text-center">
                    <Lock className="inline w-3 h-3 mr-1" />
                    Validação automática de coerência incluída
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border-4 border-red-600 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-black text-red-600 mb-4">Scores (0-10)</h3>

            <div className="space-y-4 mb-6">
              {(['hook', 'retention', 'clarity', 'cta'] as const).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                    {key}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={scores[key]}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 font-semibold mt-1">
                    <span>0</span>
                    <span className="text-lg font-black text-red-600">{scores[key]}</span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Insight (22-28 words)
              </label>
              <textarea
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:outline-none"
                rows={4}
                placeholder="Problem → Specific change → Why it improves..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Word count: {insight.split(' ').filter((w) => w).length}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3 flex items-start gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={submitEvaluation}
              disabled={loading || watchTime < 20}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-red-600 mb-6">Video Library</h1>

      {videos.length === 0 ? (
        <div className="bg-white border-4 border-red-600 rounded-2xl p-8 text-center shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700">No videos available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white border-4 border-red-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="aspect-video bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{video.topic || 'Untitled Video'}</h3>
              <p className="text-sm text-gray-600 mb-4">Duration: {video.duration_seconds}s</p>
              <button
                onClick={() => startEvaluation(video)}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                Evaluate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
