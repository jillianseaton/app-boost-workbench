import React, { useEffect, useState } from 'react';
import { useENS } from '@/hooks/useENS';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, User } from 'lucide-react';

interface ENSDisplayProps {
  address: string;
  showAvatar?: boolean;
  showFullAddress?: boolean;
  className?: string;
}

const ENSDisplay: React.FC<ENSDisplayProps> = ({
  address,
  showAvatar = false,
  showFullAddress = false,
  className = '',
}) => {
  const { resolveENS, getDisplayName, isMainnet } = useENS();
  const [ensData, setEnsData] = useState({ name: null, avatar: null, isLoading: true });

  useEffect(() => {
    if (address && isMainnet) {
      resolveENS(address).then(setEnsData);
    } else {
      setEnsData({ name: null, avatar: null, isLoading: false });
    }
  }, [address, resolveENS, isMainnet]);

  if (!address) return null;

  const displayName = ensData.name || getDisplayName(address);
  const isENS = Boolean(ensData.name);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          {ensData.avatar ? (
            <img 
              src={ensData.avatar} 
              alt="ENS Avatar" 
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <User className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm ${isENS ? 'text-blue-600' : 'text-muted-foreground'}`}>
          {displayName}
        </span>
        
        {isENS && (
          <Badge variant="secondary" className="text-xs">
            ENS
          </Badge>
        )}
        
        {!isMainnet && address && (
          <Badge variant="outline" className="text-xs">
            {getDisplayName(address)}
          </Badge>
        )}
      </div>
      
      {showFullAddress && address && (
        <a
          href={`https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-blue-600 flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </a>
      )}
    </div>
  );
};

export default ENSDisplay;