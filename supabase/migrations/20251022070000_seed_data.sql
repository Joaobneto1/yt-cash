/*
  # Seed Data for YouTube Rewards App

  1. System Configuration
    - app_limits: Daily/weekly quotas, validation thresholds

  2. Initial Data
    - missions: 4 starter missions (D0, D1, D2, D3)
    - videos: 3 sample videos for evaluation
    - rewards_catalog: Withdrawal reward

  3. Security
    - All data follows RLS policies
    - App limits is a singleton config table
*/

-- =============================================
-- APP LIMITS (System Configuration)
-- =============================================
INSERT INTO app_limits (
  id,
  free_daily_quota,
  free_weekly_quota,
  pro_daily_quota,
  pro_weekly_quota,
  pro_plus_daily_quota,
  pro_plus_weekly_quota,
  watch_time_threshold_seconds,
  coherence_min_score,
  duplicate_window
) VALUES (
  1,
  10,
  40,
  50,
  250,
  100,
  700,
  20,
  0.6,
  50
) ON CONFLICT (id) DO UPDATE SET
  free_daily_quota = 10,
  free_weekly_quota = 40,
  pro_daily_quota = 50,
  pro_weekly_quota = 250,
  pro_plus_daily_quota = 100,
  pro_plus_weekly_quota = 700,
  watch_time_threshold_seconds = 20,
  coherence_min_score = 0.6,
  duplicate_window = 50;

-- =============================================
-- MISSIONS (Gamification)
-- =============================================
INSERT INTO missions (code, title, description, target, bonus_points, active) VALUES
  ('D0', 'Start the Right Way', 'Accept terms and watch the 45s tour.', 1, 50, true),
  ('D1', '5 Valid Evaluations', 'Submit 5 valid evaluations with at least 80% approval.', 5, 100, true),
  ('D2', 'Master the Rules', 'Read Withdrawal and Refund and answer 3 quick questions.', 1, 50, true),
  ('D3', '10 PRO Evaluations', 'Do 10 evaluations with at least 90% approval.', 10, 200, true)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  target = EXCLUDED.target,
  bonus_points = EXCLUDED.bonus_points,
  active = EXCLUDED.active;

-- =============================================
-- VIDEOS (Sample Content)
-- =============================================
INSERT INTO videos (source_url, thumb_url, duration_seconds, topic, status) VALUES
  (
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    28,
    'hook',
    'active'
  ),
  (
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    36,
    'retention',
    'active'
  ),
  (
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    22,
    'clarity',
    'active'
  )
ON CONFLICT (source_url) DO UPDATE SET
  thumb_url = EXCLUDED.thumb_url,
  duration_seconds = EXCLUDED.duration_seconds,
  topic = EXCLUDED.topic,
  status = EXCLUDED.status;

-- =============================================
-- REWARDS CATALOG
-- =============================================
INSERT INTO rewards_catalog (title, min_points, active, terms_url) VALUES
  ('Withdrawal', 5000, true, 'https://example.com/withdrawal-terms')
ON CONFLICT DO NOTHING;
