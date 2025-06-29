
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWeb3 } from '@/hooks/useWeb3';
import { useToast } = '@/hooks/use-toast';
import { Code, Send, Eye } from 'lucide-react';

const ContractInteraction: React.FC = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [contractABI, setContractABI] = useState('');
  const [methodName, setMethodName] = useState('');
  const [methodParams, setMethodParams] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const { createContract, callContractMethod, sendContractTransaction, accounts, isConnected } = useWeb3();
  const { toast } = useToast();

  const handleCreateContract = () => {
    try {
      const abi = JSON.parse(contractABI);
      const contract = createContract({
        address: contractAddress,
        abi: abi
      });
      
      if (contract) {
        toast({
          title: "Contract Created",
          description: `Contract instance created for ${contractAddress}`,
        });
      }
    } catch (error) {
      toast({
        title: "Invalid ABI",
        description: "Please provide a valid JSON ABI",
        variant: "destructive",
      });
    }
  };

  const handleCallMethod = async (isReadOnly: boolean = true) => {
    if (!contractAddress || !methodName) {
      toast({
        title: "Missing Information",
        description: "Please provide contract address and method name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const params = methodParams ? JSON.parse(methodParams) : [];
      
      let methodResult;
      if (isReadOnly) {
        methodResult = await callContractMethod(contractAddress, methodName, params);
      } else {
        if (!isConnected || accounts.length === 0) {
          throw new Error('Wallet not connected');
        }
        methodResult = await sendContractTransaction(contractAddress, methodName, params);
      }
      
      setResult(methodResult);
      toast({
        title: `Method ${isReadOnly ? 'Called' : 'Executed'}`,
        description: `${methodName} executed successfully`,
      });
    } catch (error) {
      console.error('Contract method error:', error);
      toast({
        title: "Method Failed",
        description: error instanceof Error ? error.message : "Failed to execute method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Smart Contract Interaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contract Address</label>
          <Input
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contract ABI (JSON)</label>
          <Textarea
            placeholder='[{"inputs":[],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
            value={contractABI}
            onChange={(e) => setContractABI(e.target.value)}
            rows={4}
          />
          <Button onClick={handleCreateContract} variant="outline" size="sm">
            Create Contract Instance
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Method Name</label>
          <Input
            placeholder="balances"
            value={methodName}
            onChange={(e) => setMethodName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Method Parameters (JSON Array)</label>
          <Input
            placeholder='["0x123..."]'
            value={methodParams}
            onChange={(e) => setMethodParams(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleCallMethod(true)}
            disabled={loading}
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            {loading ? "Calling..." : "Call (Read)"}
          </Button>
          
          <Button
            onClick={() => handleCallMethod(false)}
            disabled={loading || !isConnected}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Transaction"}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Result</label>
            <div className="bg-gray-100 p-3 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md">
            Connect your wallet to send transactions
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractInteraction;
