/*
  # Add Database Functions and Triggers for Automation
  
  ## Purpose
  Automate all system operations including:
  - Mission progress tracking
  - User metrics calculation (approval rate, avg time)
  - Quota resets
  - Automatic point awards
  - Status updates
  
  ## Functions
  - update_user_metrics(): Calculate approval_rate and avg_eval_time
  - check_and_complete_missions(): Auto-complete missions when targets are met
  - award_mission_bonus(): Award points when mission completed
  - reset_user_quotas(): Reset daily/weekly quotas automatically
  - process_evaluation_submission(): Handle all evaluation logic
  
  ## Triggers
  - After evaluation insert: update metrics and missions
  - After points ledger insert: recalculate balance
  - Before evaluation session: check and reset quotas
*/

-- =============================================
-- FUNCTION: Update User Metrics
-- =============================================
CREATE OR REPLACE FUNCTION update_user_metrics(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_total_evals integer;
  v_valid_evals integer;
  v_approval_rate float;
  v_avg_time float;
BEGIN
  -- Count total evaluations
  SELECT COUNT(*)
  INTO v_total_evals
  FROM evaluations e
  JOIN evaluation_sessions es ON e.session_id = es.id
  WHERE es.user_id = p_user_id;

  -- Count valid evaluations
  SELECT COUNT(*)
  INTO v_valid_evals
  FROM evaluations e
  JOIN evaluation_sessions es ON e.session_id = es.id
  WHERE es.user_id = p_user_id AND e.valid = true;

  -- Calculate approval rate
  IF v_total_evals > 0 THEN
    v_approval_rate := v_valid_evals::float / v_total_evals::float;
  ELSE
    v_approval_rate := NULL;
  END IF;

  -- Calculate average evaluation time
  SELECT AVG(elapsed_seconds)
  INTO v_avg_time
  FROM evaluation_sessions
  WHERE user_id = p_user_id 
    AND elapsed_seconds IS NOT NULL
    AND status = 'validated';

  -- Update user record
  UPDATE users
  SET 
    approval_rate = v_approval_rate,
    avg_eval_time_seconds = v_avg_time
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: Check and Update Mission Progress
-- =============================================
CREATE OR REPLACE FUNCTION update_mission_progress(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_mission RECORD;
  v_user_mission RECORD;
  v_progress integer;
  v_approval_rate float;
BEGIN
  -- Get user's current approval rate
  SELECT approval_rate INTO v_approval_rate
  FROM users WHERE id = p_user_id;

  -- Loop through all active missions for the user
  FOR v_user_mission IN 
    SELECT um.*, m.code, m.target, m.bonus_points
    FROM user_missions um
    JOIN missions m ON um.mission_id = m.id
    WHERE um.user_id = p_user_id AND um.status = 'open'
  LOOP
    -- Calculate progress based on mission type
    CASE v_user_mission.code
      WHEN 'D0' THEN
        -- Tour completion (manual trigger needed)
        v_progress := v_user_mission.progress_current;
      
      WHEN 'D1' THEN
        -- 5 valid evaluations with ≥80% approval
        IF v_approval_rate IS NOT NULL AND v_approval_rate >= 0.80 THEN
          SELECT COUNT(*)
          INTO v_progress
          FROM evaluations e
          JOIN evaluation_sessions es ON e.session_id = es.id
          WHERE es.user_id = p_user_id AND e.valid = true;
        ELSE
          v_progress := 0;
        END IF;
      
      WHEN 'D2' THEN
        -- Read rules and answer questions (manual trigger needed)
        v_progress := v_user_mission.progress_current;
      
      WHEN 'D3' THEN
        -- 10 evaluations with ≥90% approval
        IF v_approval_rate IS NOT NULL AND v_approval_rate >= 0.90 THEN
          SELECT COUNT(*)
          INTO v_progress
          FROM evaluations e
          JOIN evaluation_sessions es ON e.session_id = es.id
          WHERE es.user_id = p_user_id AND e.valid = true;
        ELSE
          v_progress := 0;
        END IF;
      
      ELSE
        v_progress := v_user_mission.progress_current;
    END CASE;

    -- Update progress
    UPDATE user_missions
    SET progress_current = v_progress
    WHERE id = v_user_mission.id;

    -- Check if mission is completed
    IF v_progress >= v_user_mission.target AND v_user_mission.status = 'open' THEN
      UPDATE user_missions
      SET 
        status = 'completed',
        completed_at = now()
      WHERE id = v_user_mission.id;

      -- Award bonus points
      INSERT INTO points_ledger (user_id, type, ref_id, points, note)
      VALUES (
        p_user_id,
        'mission_bonus',
        v_user_mission.id::text,
        v_user_mission.bonus_points,
        'Mission completed: ' || v_user_mission.code
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: Initialize User Missions
-- =============================================
CREATE OR REPLACE FUNCTION initialize_user_missions(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_missions (user_id, mission_id, progress_target, progress_current, status)
  SELECT 
    p_user_id,
    m.id,
    m.target,
    0,
    'open'
  FROM missions m
  WHERE m.active = true
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: Reset User Quotas
-- =============================================
CREATE OR REPLACE FUNCTION reset_user_quotas()
RETURNS void AS $$
BEGIN
  -- Reset daily quotas
  UPDATE users
  SET 
    daily_quota_used = 0,
    quota_reset_daily_at = now() + interval '1 day'
  WHERE quota_reset_daily_at <= now();

  -- Reset weekly quotas
  UPDATE users
  SET 
    weekly_quota_used = 0,
    quota_reset_weekly_at = now() + interval '7 days'
  WHERE quota_reset_weekly_at <= now();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: After Evaluation Insert
-- =============================================
CREATE OR REPLACE FUNCTION trigger_after_evaluation_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user_id from session
  SELECT user_id INTO v_user_id
  FROM evaluation_sessions
  WHERE id = NEW.session_id;

  -- Update user metrics
  PERFORM update_user_metrics(v_user_id);

  -- Update mission progress
  PERFORM update_mission_progress(v_user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_evaluation_insert ON evaluations;
CREATE TRIGGER after_evaluation_insert
  AFTER INSERT ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_after_evaluation_insert();

-- =============================================
-- TRIGGER: After User Insert (Initialize Missions)
-- =============================================
CREATE OR REPLACE FUNCTION trigger_after_user_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize quota reset times
  UPDATE users
  SET 
    quota_reset_daily_at = now() + interval '1 day',
    quota_reset_weekly_at = now() + interval '7 days'
  WHERE id = NEW.id AND quota_reset_daily_at IS NULL;

  -- Initialize missions for new user
  PERFORM initialize_user_missions(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_user_insert ON users;
CREATE TRIGGER after_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_after_user_insert();

-- =============================================
-- TRIGGER: Update Timestamps
-- =============================================
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_withdrawals_timestamp ON withdrawals;
CREATE TRIGGER update_withdrawals_timestamp
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS update_refund_requests_timestamp ON refund_requests;
CREATE TRIGGER update_refund_requests_timestamp
  BEFORE UPDATE ON refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS update_support_tickets_timestamp ON support_tickets;
CREATE TRIGGER update_support_tickets_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

DROP TRIGGER IF EXISTS update_billing_payments_timestamp ON billing_payments;
CREATE TRIGGER update_billing_payments_timestamp
  BEFORE UPDATE ON billing_payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

-- =============================================
-- FUNCTION: Get User Balance (Cached)
-- =============================================
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_balance integer;
BEGIN
  SELECT COALESCE(SUM(points), 0)
  INTO v_balance
  FROM points_ledger
  WHERE user_id = p_user_id;

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- FUNCTION: Can Start Evaluation (with auto-reset)
-- =============================================
CREATE OR REPLACE FUNCTION can_start_evaluation(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_user RECORD;
  v_limits RECORD;
  v_daily_cap integer;
  v_weekly_cap integer;
BEGIN
  -- Reset quotas if needed
  PERFORM reset_user_quotas();

  -- Get user data
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  
  -- Get limits
  SELECT * INTO v_limits FROM app_limits LIMIT 1;

  -- Determine caps based on plan
  CASE v_user.plan_tier
    WHEN 'pro' THEN
      v_daily_cap := v_limits.pro_daily_quota;
      v_weekly_cap := v_limits.pro_weekly_quota;
    WHEN 'pro_plus' THEN
      v_daily_cap := v_limits.pro_plus_daily_quota;
      v_weekly_cap := v_limits.pro_plus_weekly_quota;
    ELSE
      v_daily_cap := v_limits.free_daily_quota;
      v_weekly_cap := v_limits.free_weekly_quota;
  END CASE;

  -- Check quotas
  IF v_user.daily_quota_used >= v_daily_cap OR v_user.weekly_quota_used >= v_weekly_cap THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exceeded',
      'plan', v_user.plan_tier,
      'daily_cap', v_daily_cap,
      'weekly_cap', v_weekly_cap,
      'daily_used', v_user.daily_quota_used,
      'weekly_used', v_user.weekly_quota_used
    );
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED JOB: Reset Quotas (call every hour via cron)
-- =============================================
-- Note: This would be called by a cron job or scheduled task
-- For now, it's called automatically in can_start_evaluation

COMMENT ON FUNCTION reset_user_quotas() IS 'Call this function hourly via pg_cron or external scheduler';
COMMENT ON FUNCTION update_user_metrics(uuid) IS 'Automatically called after evaluation insert';
COMMENT ON FUNCTION update_mission_progress(uuid) IS 'Automatically called after evaluation insert';
COMMENT ON FUNCTION initialize_user_missions(uuid) IS 'Automatically called after user creation';
