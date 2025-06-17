
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  created_at: string;
  details: any;
}

interface AuditHistoryProps {
  auditLog: AuditLogEntry[];
}

const AuditHistory: React.FC<AuditHistoryProps> = ({ auditLog }) => {
  return (
    <div className="space-y-2">
      {auditLog.slice(0, 20).map((log) => {
        const amount = typeof log.details === 'object' && 
                      log.details && 
                      typeof log.details === 'object' && 
                      'amount' in log.details 
          ? Number(log.details.amount) || 0 
          : 0;
        
        const verificationConfirmed = typeof log.details === 'object' && 
                                     log.details && 
                                     typeof log.details === 'object' && 
                                     'verification_confirmed' in log.details 
          ? Boolean(log.details.verification_confirmed) 
          : false;
        
        return (
          <Card key={log.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.action.includes('verified') ? 'bg-green-500' :
                    log.action.includes('failed') ? 'bg-red-500' :
                    log.action.includes('deposit') ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">
                      {log.action.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {amount > 0 && (
                    <Badge variant="outline">
                      ${amount.toFixed(2)}
                    </Badge>
                  )}
                  {verificationConfirmed && (
                    <Badge className="bg-green-100 text-green-800">
                      <Lock className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AuditHistory;
