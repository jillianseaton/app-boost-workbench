import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTodaysEarnings = (userId?: string) => {
  const [todaysEarnings, setTodaysEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTodaysEarnings = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_todays_earnings', {
        user_uuid: userId
      });

      if (error) throw error;

      setTodaysEarnings(data || 0);
    } catch (error) {
      console.error('Error fetching today\'s earnings:', error);
      toast({
        title: "Error",
        description: "Failed to load today's earnings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchTodaysEarnings();
  }, [fetchTodaysEarnings]);

  return {
    todaysEarnings,
    loading,
    refreshTodaysEarnings: fetchTodaysEarnings
  };
};