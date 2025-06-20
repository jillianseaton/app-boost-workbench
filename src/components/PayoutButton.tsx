
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PayoutButton() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayout = async () => {
    setLoading(true);
    setStatus("Processing payout...");

    try {
      const res = await fetch("https://laoltiyaaagiiutahypb.supabase.co/functions/v1/payout-commissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // no body needed if Stripe ID is hardcoded
      });

      const result = await res.json();

      if (res.ok) {
        setStatus(`✅ Payout sent! $${result.amount.toFixed(2)} transferred`);
      } else {
        setStatus(`❌ Error: ${result.error || result.message}`);
      }
    } catch (err) {
      setStatus(`❌ Request failed: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Button onClick={handlePayout} disabled={loading} className="w-full">
        {loading ? "Sending..." : "💸 Request Payout"}
      </Button>
      {status && (
        <p className="text-sm text-center">{status}</p>
      )}
    </div>
  );
}
