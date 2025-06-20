
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const GoogleAuth: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Google login error:', error);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Signed in as: {user.email}
        </span>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleGoogleLogin} className="w-full">
      Sign in with Google
    </Button>
  );
};

export default GoogleAuth;
