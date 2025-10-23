import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, TrendingUp, Clock, BarChart3, Play, DollarSign, RotateCcw } from 'lucide-react';

export default function HomePage() {
  const { userProfile } = useAuth();
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    approvalRate: 0,
    avgTime: 0,
    dailyUsed: 0,
    weeklyUsed: 0,
  });
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile?.id) {
      loadBalance();
      loadStats();
      loadMissions();
    }
  }, [userProfile]);

  const loadBalance = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await (supabase
        .from('points_ledger') as any)
        .select('points')
        .eq('user_id', userProfile.id);

      if (error) throw error;
      const total = data?.reduce((sum: number, row: any) => sum + row.points, 0) || 0;
      setBalance(total);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadStats = async () => {
    if (!userProfile) return;

    setStats({
      approvalRate: userProfile.approval_rate || 0,
      avgTime: userProfile.avg_eval_time_seconds || 0,
      dailyUsed: userProfile.daily_quota_used || 0,
      weeklyUsed: userProfile.weekly_quota_used || 0,
    });
  };

  const loadMissions = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_missions')
        .select('*, mission:missions(*)')
        .eq('user_id', userProfile.id)
        .eq('status', 'open')
        .order('progress_current', { ascending: false })
        .limit(1);

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Error loading missions:', error);
    }
  };

  const getPlanLimits = () => {
    const tier = userProfile?.plan_tier || 'free';
    const limits = {
      free: { daily: 10, weekly: 40 },
      pro: { daily: 50, weekly: 250 },
      pro_plus: { daily: 100, weekly: 700 },
    };
    return limits[tier as keyof typeof limits] || limits.free;
  };

  const limits = getPlanLimits();

  return (
    <div>
      <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8 rounded">
        <p className="text-sm text-gray-700">
          Independent, educational and research program. Not affiliated with YouTube or Google.
          No income claims. Validation, withdrawal, KYC and refund rules apply. See details in the app.
        </p>
      </div>

      <div className="mb-6 lg:mb-8">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl border-4 border-red-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, transparent 20%, rgba(255,255,255,0.1) 21%, transparent 21%)',
          }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3 lg:mb-4">
              <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-300" />
              <p className="text-red-100 text-base lg:text-lg font-semibold uppercase tracking-wide">Your Balance</p>
            </div>
            <div className="flex items-baseline gap-3 lg:gap-4">
              <p className="text-5xl lg:text-7xl font-black text-white neon-balance">
                {balance.toLocaleString()}
              </p>
              <span className="text-2xl lg:text-3xl text-red-200 font-bold">points</span>
            </div>
            <p className="text-red-100 mt-2 text-xs lg:text-sm">
              = ${(balance / 100).toFixed(2)} USD equivalent
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white border-4 border-red-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold">Approval Rate</p>
              <p className="text-2xl font-black text-red-600">
                {stats.approvalRate ? (stats.approvalRate * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-red-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold">Average Time</p>
              <p className="text-2xl font-black text-red-600">
                {stats.avgTime ? Math.round(stats.avgTime) : '0'}s
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-red-600 rounded-2xl p-6 shadow-lg sm:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 rounded-full p-3">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-xs font-semibold">Quotas Used</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-2xl font-black text-red-600">
                    {stats.dailyUsed}/{limits.daily}
                  </p>
                  <p className="text-xs text-gray-500">daily</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-red-600">
                    {stats.weeklyUsed}/{limits.weekly}
                  </p>
                  <p className="text-xs text-gray-500">weekly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-4 border-red-600 rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">PLAN</p>
            <p className="text-3xl font-black text-red-600 uppercase">
              {userProfile?.plan_tier || 'FREE'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-semibold">AI COACH</p>
            <p className="text-2xl font-black">
              {userProfile?.ia_upgrade ? (
                <span className="text-green-600">✓ ACTIVE</span>
              ) : (
                <span className="text-gray-400">✗ LOCKED</span>
              )}
            </p>
          </div>
        </div>

        {userProfile?.plan_tier === 'free' && (
          <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
            🚀 Upgrade to PRO — Unlock AI Coach
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <button className="bg-red-600 text-white p-4 lg:p-6 rounded-2xl font-bold text-base lg:text-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 border-4 border-red-700 flex items-center justify-center gap-2 lg:gap-3">
          <Play className="w-5 h-5 lg:w-6 lg:h-6" />
          <span className="text-sm lg:text-base">Evaluate Video Now</span>
        </button>

        <button className="bg-white text-red-600 p-4 lg:p-6 rounded-2xl font-bold text-base lg:text-lg hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 border-4 border-red-600 flex items-center justify-center gap-2 lg:gap-3">
          <DollarSign className="w-5 h-5 lg:w-6 lg:h-6" />
          <span className="text-sm lg:text-base">Request Withdrawal</span>
        </button>

        <button className="bg-white text-red-600 p-4 lg:p-6 rounded-2xl font-bold text-base lg:text-lg hover:bg-red-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 border-4 border-red-600 flex items-center justify-center gap-2 lg:gap-3">
          <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6" />
          <span className="text-sm lg:text-base">Request Refund</span>
        </button>
      </div>

      {missions.length > 0 && missions[0] && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-500 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <p className="text-sm text-gray-600 font-semibold">ACTIVE MISSION</p>
                <p className="text-xl font-black text-gray-900">{missions[0].mission.title}</p>
                <p className="text-sm text-gray-600">{missions[0].mission.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-yellow-600">
                +{missions[0].mission.bonus_points}
              </p>
              <p className="text-xs text-gray-500">bonus points</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700 font-semibold">Progress</span>
              <span className="font-bold text-yellow-600">
                {missions[0].progress_current} / {missions[0].progress_target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-300">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500 shadow-lg"
                style={{
                  width: `${Math.min((missions[0].progress_current / missions[0].progress_target) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
