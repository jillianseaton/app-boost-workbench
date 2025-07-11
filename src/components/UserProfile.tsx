import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

const UserProfile = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span>Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Please sign in to view your profile
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Username:</label>
          <div className="mt-1">
            {profile?.username ? (
              <Badge variant="secondary" className="text-base">
                {profile.username}
              </Badge>
            ) : (
              <span className="text-muted-foreground">No username set</span>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email:</label>
          <div className="mt-1 text-sm">
            {user.email}
          </div>
        </div>

        {profile?.phone_number && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone:</label>
            <div className="mt-1 text-sm">
              {profile.phone_number}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;