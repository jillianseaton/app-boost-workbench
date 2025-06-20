
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function PayoutButton() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  const handlePayout = async () => {
    setLoading(true);
    setStatus("Processing payout...");

    if (!session?.access_token) {
      setStatus("❌ Not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('payout-commissions', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus(`✅ Payout sent! $${data.amount.toFixed(2)} transferred`);
      } else {
        setStatus(`❌ Error: ${data?.error || data?.message}`);
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
