import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AutoLogUUID = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      console.log('🆔 Your UUID:', user.id);
      alert(`Your UUID: ${user.id}`);
    }
  }, [user?.id]);

  return null;
};

export default AutoLogUUID;