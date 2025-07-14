// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Coinbase API payout implementation
const COINBASE_API_KEY = Deno.env.get("COINBASE_API_KEY")!;
const COINBASE_API_SECRET = Deno.env.get("COINBASE_API_SECRET")!;
const COINBASE_ACCOUNT_ID = Deno.env.get("COINBASE_ACCOUNT_ID")!; // The Coinbase BTC account/wallet ID

async function sendCoinbasePayout(recipientAddress: string, amountBTC: string): Promise<{ txid: string }> {
  const endpoint = `https://api.coinbase.com/v2/accounts/${COINBASE_ACCOUNT_ID}/transactions`;
  const body = {
    type: "send",
    to: recipientAddress,
    amount: amountBTC,
    currency: "BTC",
    description: "Commission payout",
  };

  // Coinbase uses HMAC authentication
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const requestPath = `/v2/accounts/${COINBASE_ACCOUNT_ID}/transactions`;
  const method = "POST";
  const bodyString = JSON.stringify(body);
  const prehash = timestamp + method + requestPath + bodyString;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(COINBASE_API_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureArrayBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(prehash));
  const signature = Array.from(new Uint8Array(signatureArrayBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const headers = {
    "CB-ACCESS-KEY": COINBASE_API_KEY,
    "CB-ACCESS-SIGN": signature,
    "CB-ACCESS-TIMESTAMP": timestamp,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: bodyString,
  });
  const result = await res.json();

  if (!res.ok || result.errors) {
    throw new Error(`Coinbase payout failed: ${JSON.stringify(result.errors || result)}`);
  }

  return { txid: result.data.id };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Init Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { userId, coinbaseAddress } = body;

    if (!userId || !coinbaseAddress) {
      throw new Error("Missing userId or coinbaseAddress");
    }

    // 1. Fetch all unpaid commissions for the user
    const { data: unpaidComms, error: commsErr } = await supabase
      .from("commissions")
      .select("*")
      .eq("user_id", userId)
      .eq("paid_out", false);

    if (commsErr) throw new Error("Failed to fetch commissions: " + commsErr.message);

    if (!unpaidComms || unpaidComms.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No unpaid commissions to payout." }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // 2. Calculate total payout amount in USD
    const totalCents = unpaidComms.reduce((sum: number, comm: any) => sum + comm.amount_earned_cents, 0);
    const totalUSD = totalCents / 100;

    // 3. Get current BTC price
    const { data: btcPriceData, error: btcPriceErr } = await supabase.functions.invoke("get-btc-price");
    if (btcPriceErr || !btcPriceData?.price) throw new Error("Failed to fetch BTC price.");
    const btcPrice = btcPriceData.price;
    const amountBTC = (totalUSD / btcPrice).toFixed(8);

    // Minimum payout enforcement (example: $10)
    if (totalUSD < 10) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Minimum payout is $10. Accumulate more commissions before payout.",
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // 4. Send payout using Coinbase
    let txid: string;
    try {
      const payout = await sendCoinbasePayout(coinbaseAddress, amountBTC);
      txid = payout.txid;
    } catch (sendErr) {
      throw new Error("Failed to send payout: " + (sendErr?.message || sendErr));
    }

    // 5. Mark all these commissions as paid and store txid
    const { error: updateErr } = await supabase
      .from("commissions")
      .update({ paid_out: true, paid_at: new Date().toISOString(), payout_txid: txid })
      .eq("user_id", userId)
      .eq("paid_out", false);

    if (updateErr) {
      throw new Error("Payout sent, but failed to update DB: " + updateErr.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        totalUSD,
        btcAmount: amountBTC,
        btcPrice,
        txid,
        commissionsPaid: unpaidComms.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});