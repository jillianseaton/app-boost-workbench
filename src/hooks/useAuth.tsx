
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  start_date: string;
  expiry_date: string;
  created_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data || null);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchSubscription(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchSubscription(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const createSubscription = async () => {
    if (!user) return;

    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: user.id,
            plan: 'operator-license',
            status: 'active',
            amount: 9.99,
            currency: 'USD',
            expiry_date: expiryDate.toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  const refreshSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error refreshing subscription status:', error);
        return;
      }

      // Re-fetch subscription from database after Stripe check
      await fetchSubscription(user.id);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  };

  return {
    user,
    session,
    profile,
    subscription,
    loading,
    signOut,
    createSubscription,
    refreshSubscriptionStatus,
    hasActiveSubscription: !!subscription,
  };
};
