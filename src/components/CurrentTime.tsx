
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-xl font-mono">
            {currentTime.toLocaleString('en-US', {
              timeZone: 'America/New_York',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })} ET
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentTime;
