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

    const payload = await req.json();
    const { event, user_id, product, provider, amount, external_id } = payload;

    if (event === "payment.succeeded") {
      // Insert payment record
      await supabase.from("billing_payments").insert({
        user_id,
        provider: provider || "stripe",
        product,
        amount,
        currency: "USD",
        status: "paid",
        external_id,
      });

      // Update user plan
      const planTier = product === "pro_month" ? "pro" : "pro_plus";
      const renewsAt = new Date();
      
      if (product === "pro_month") {
        renewsAt.setMonth(renewsAt.getMonth() + 1);
      } else if (product === "pro_plus_year") {
        renewsAt.setFullYear(renewsAt.getFullYear() + 1);
      }

      await supabase.from("users").update({
        plan_tier: planTier,
        plan_status: "active",
        plan_renews_at: renewsAt.toISOString(),
        ia_upgrade: true,
        ia_upgrade_at: new Date().toISOString(),
        daily_quota_used: 0,
        weekly_quota_used: 0,
      }).eq("id", user_id);

      return new Response(
        JSON.stringify({ success: true, message: "Payment processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (event === "subscription.canceled") {
      await supabase.from("users").update({
        plan_status: "canceled",
        plan_tier: "free",
        ia_upgrade: false,
      }).eq("id", user_id);

      return new Response(
        JSON.stringify({ success: true, message: "Subscription canceled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown event type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});