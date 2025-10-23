import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date().toISOString();

    // Reset daily quotas
    const { data: dailyReset } = await supabase
      .from("users")
      .update({
        daily_quota_used: 0,
        quota_reset_daily_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .lte("quota_reset_daily_at", now)
      .select("id");

    // Reset weekly quotas
    const { data: weeklyReset } = await supabase
      .from("users")
      .update({
        weekly_quota_used: 0,
        quota_reset_weekly_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .lte("quota_reset_weekly_at", now)
      .select("id");

    return new Response(
      JSON.stringify({
        success: true,
        daily_resets: dailyReset?.length || 0,
        weekly_resets: weeklyReset?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});