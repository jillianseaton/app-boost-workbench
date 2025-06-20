
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Commission {
  id: string;
  user_id: string;
  amount_earned_cents: number;
  description: string | null;
  source: string;
  paid_out: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CommissionSummary {
  total_unpaid_cents: number;
  total_paid_cents: number;
  unpaid_count: number;
  paid_count: number;
}

export const useCommissions = (userId?: string) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({
    total_unpaid_cents: 0,
    total_paid_cents: 0,
    unpaid_count: 0,
    paid_count: 0
  });
  const [loading, setLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const { toast } = useToast();

  const fetchCommissions = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCommissions(data || []);
      
      // Calculate summary
      const unpaid = (data || []).filter(c => !c.paid_out);
      const paid = (data || []).filter(c => c.paid_out);
      
      setSummary({
        total_unpaid_cents: unpaid.reduce((sum, c) => sum + c.amount_earned_cents, 0),
        total_paid_cents: paid.reduce((sum, c) => sum + c.amount_earned_cents, 0),
        unpaid_count: unpaid.length,
        paid_count: paid.length
      });
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast({
        title: "Error",
        description: "Failed to load commission data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const addCommission = useCallback(async (
    amountCents: number, 
    description: string, 
    source: string = 'task_completion'
  ) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('commissions')
        .insert({
          user_id: userId,
          amount_earned_cents: amountCents,
          description,
          source
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Commission added:', data);
      
      // Refresh commissions
      await fetchCommissions();
      
      return data;
    } catch (error) {
      console.error('Error adding commission:', error);
      toast({
        title: "Error",
        description: "Failed to record commission",
        variant: "destructive",
      });
    }
  }, [userId, fetchCommissions, toast]);

  const processPayouts = useCallback(async () => {
    setPayoutLoading(true);
    try {
      console.log('Processing commission payouts...');
      
      const { data, error } = await supabase.functions.invoke('payout-commissions', {
        body: {},
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payout Processed",
          description: `Successfully paid out $${data.amount} for ${data.commissions_count} commissions`,
        });
        
        // Refresh commissions after payout
        await fetchCommissions();
      } else {
        throw new Error(data?.error || 'Payout failed');
      }
    } catch (error) {
      console.error('Payout error:', error);
      toast({
        title: "Payout Failed",
        description: error instanceof Error ? error.message : "Failed to process payout",
        variant: "destructive",
      });
    } finally {
      setPayoutLoading(false);
    }
  }, [fetchCommissions, toast]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  return {
    commissions,
    summary,
    loading,
    payoutLoading,
    addCommission,
    processPayouts,
    refreshCommissions: fetchCommissions
  };
};
