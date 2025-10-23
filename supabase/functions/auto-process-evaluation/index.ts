import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProcessPayload {
  session_id: string;
  scores: {
    hook: number;
    retention: number;
    clarity: number;
    cta: number;
  };
  insight_text: string;
  ai_prenote_json?: any;
  ai_insight_draft?: string;
}

async function hashString(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkCoherence(scores: any, insight: string): Promise<{ score: number; notes: string[] }> {
  let coherenceScore = 0.7 + Math.random() * 0.25;
  const notes: string[] = [];
  const lowerInsight = insight.toLowerCase();

  if ((lowerInsight.includes("weak") || lowerInsight.includes("missing") || lowerInsight.includes("lacks")) &&
      (scores.hook > 8 || scores.clarity > 8)) {
    coherenceScore = Math.max(0.4, coherenceScore - 0.3);
    notes.push("Insight identifies problems but scores are very high");
  }

  if (lowerInsight.includes("audio") && scores.retention > 8) {
    coherenceScore = Math.max(0.4, coherenceScore - 0.25);
    notes.push("Audio critique conflicts with high retention score");
  }

  if ((lowerInsight.includes("call-to-action") || lowerInsight.includes("cta")) && scores.cta > 7) {
    coherenceScore = Math.max(0.5, coherenceScore - 0.2);
    notes.push("CTA criticism doesn't align with CTA score");
  }

  if (notes.length === 0) {
    notes.push("Scores and insight demonstrate reasonable alignment");
  }

  return { score: Math.round(coherenceScore * 100) / 100, notes };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: ProcessPayload = await req.json();
    const { session_id, scores, insight_text, ai_prenote_json, ai_insight_draft } = payload;

    // Get session with user info
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("evaluation_sessions")
      .select("*, user:users!inner(*), video:videos(*)")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ ok: false, error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = session.user as any;

    // Get app limits
    const { data: limits } = await supabaseAdmin
      .from("app_limits")
      .select("*")
      .single();

    if (!limits) {
      return new Response(
        JSON.stringify({ ok: false, error: "App limits not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate watch time
    if (session.watch_time_seconds < limits.watch_time_threshold_seconds) {
      return new Response(
        JSON.stringify({ ok: false, error: "Insufficient watch time", reason: "watch_time" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash insight for duplicate detection
    const cleaned = insight_text.trim().toLowerCase().replace(/\s+/g, " ");
    const insightHash = await hashString(cleaned);

    // Check for duplicates
    const { data: recentEvals } = await supabaseAdmin
      .from("evaluations")
      .select("insight_hash, session:evaluation_sessions!inner(user_id)")
      .eq("session.user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limits.duplicate_window);

    if (recentEvals?.some((e: any) => e.insight_hash === insightHash)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Duplicate insight detected", reason: "duplicate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check coherence
    const coherenceResult = await checkCoherence(scores, insight_text);

    if (coherenceResult.score < limits.coherence_min_score) {
      return new Response(
        JSON.stringify({ ok: false, error: "Coherence check failed", reason: "coherence", details: coherenceResult }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert evaluation
    const { data: evaluation, error: evalError } = await supabaseAdmin
      .from("evaluations")
      .insert({
        session_id,
        score_hook: scores.hook,
        score_retention: scores.retention,
        score_clarity: scores.clarity,
        score_cta: scores.cta,
        insight_text,
        insight_hash: insightHash,
        ai_prenote_json,
        ai_insight_draft,
        coherence_score: coherenceResult.score,
        valid: true,
        reason_invalid: "none",
      })
      .select()
      .single();

    if (evalError) {
      return new Response(
        JSON.stringify({ ok: false, error: evalError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update session
    const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
    await supabaseAdmin
      .from("evaluation_sessions")
      .update({
        submitted_at: new Date().toISOString(),
        elapsed_seconds: elapsed,
        status: "validated",
      })
      .eq("id", session_id);

    // Award points (automatically triggers points ledger insert)
    await supabaseAdmin.from("points_ledger").insert({
      user_id: user.id,
      type: "evaluation_reward",
      ref_id: evaluation.id,
      points: limits.points_per_valid_evaluation,
      note: "Valid evaluation",
    });

    // Update quotas
    await supabaseAdmin
      .from("users")
      .update({
        daily_quota_used: user.daily_quota_used + 1,
        weekly_quota_used: user.weekly_quota_used + 1,
      })
      .eq("id", user.id);

    // Triggers will automatically:
    // - Update user metrics (approval_rate, avg_eval_time_seconds)
    // - Update mission progress
    // - Award mission bonuses if completed

    return new Response(
      JSON.stringify({ ok: true, evaluation_id: evaluation.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});