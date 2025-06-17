import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Banknote, 
  History, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Edit,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Lock
} from 'lucide-react';
import { secureBankService, BankAccount } from '@/services/secureBankService';
import { useToast } from '@/hooks/use-toast';
import BankAccountForm from './BankAccountForm';
import BankAccountVerification from './BankAccountVerification';
import SecureDepositForm from './SecureDepositForm';
import BankAccountUpdateForm from './BankAccountUpdateForm';

interface SecureBankTransferDashboardProps {
  currentBalance: number;
  onDepositSuccess: (amount: number) => void;
  userEmail: string;
  userId: string;
}

const SecureBankTransferDashboard: React.FC<SecureBankTransferDashboardProps> = ({
  currentBalance,
  onDepositSuccess,
  userEmail,
  userId,
}) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAccountForUpdate, setSelectedAccountForUpdate] = useState<BankAccount | null>(null);
  const [transferStats, setTransferStats] = useState({
    totalTransferred: 0,
    pendingTransfers: 0,
    completedTransfers: 0,
    failedTransfers: 0,
  });
  const { toast } = useToast();

  const loadBankAccounts = async () => {
    try {
      const accounts = await secureBankService.getUserBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load bank accounts",
        variant: "destructive",
      });
    }
  };

  const loadAuditLog = async () => {
    try {
      const log = await secureBankService.getBankAccountAuditLog();
      setAuditLog(log);
      
      // Calculate transfer stats from audit log
      const stats = log.reduce((acc, entry) => {
        if (entry.action === 'secure_deposit_processed') {
          const amount = typeof entry.details === 'object' && entry.details && 'amount' in entry.details 
            ? Number(entry.details.amount) || 0 
            : 0;
          acc.totalTransferred += amount;
          acc.completedTransfers += 1;
        } else if (entry.action === 'secure_deposit_pending') {
          acc.pendingTransfers += 1;
        } else if (entry.action === 'secure_deposit_failed') {
          acc.failedTransfers += 1;
        }
        return acc;
      }, {
        totalTransferred: 0,
        pendingTransfers: 0,
        completedTransfers: 0,
        failedTransfers: 0,
      });
      
      setTransferStats(stats);
    } catch (error) {
      console.error('Failed to load audit log:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadBankAccounts(), loadAuditLog()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleAccountCreated = () => {
    loadBankAccounts();
    loadAuditLog();
    setActiveTab('verification');
  };

  const handleVerificationComplete = () => {
    loadBankAccounts();
    loadAuditLog();
    setActiveTab('transfer');
  };

  const handleDepositSuccess = (amount: number) => {
    onDepositSuccess(amount);
    loadAuditLog();
    setActiveTab('history');
  };

  const handleAccountUpdated = () => {
    loadBankAccounts();
    loadAuditLog();
    setSelectedAccountForUpdate(null);
    setActiveTab('verification');
  };

  const verifiedAccounts = bankAccounts.filter(account => account.verification_status === 'verified');
  const pendingAccounts = bankAccounts.filter(account => account.verification_status !== 'verified');

  const getStatusBadge = (status: string) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      verifying: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getRecentTransfers = () => {
    return auditLog
      .filter(log => log.action.includes('secure_deposit'))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading secure bank transfer dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500" />
            Secure Bank Transfer Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="update">Update</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold text-green-600">${currentBalance.toFixed(2)}</p>
                      </div>
                      <Banknote className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Verified Accounts</p>
                        <p className="text-2xl font-bold text-blue-600">{verifiedAccounts.length}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Transferred</p>
                        <p className="text-2xl font-bold text-purple-600">${transferStats.totalTransferred.toFixed(2)}</p>
                      </div>
                      <ArrowUpRight className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed Transfers</p>
                        <p className="text-2xl font-bold text-orange-600">{transferStats.completedTransfers}</p>
                      </div>
                      <History className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {verifiedAccounts.length === 0 ? (
                      <Button onClick={() => setActiveTab('accounts')} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Bank Account
                      </Button>
                    ) : (
                      <>
                        <Button onClick={() => setActiveTab('transfer')} className="w-full">
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Transfer to Bank Account
                        </Button>
                        <Button onClick={() => setActiveTab('accounts')} variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Account
                        </Button>
                      </>
                    )}
                    {pendingAccounts.length > 0 && (
                      <Button onClick={() => setActiveTab('verification')} variant="outline" className="w-full">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Complete Verification ({pendingAccounts.length})
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Recent Transfer Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getRecentTransfers().length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No recent transfers</p>
                    ) : (
                      <div className="space-y-3">
                        {getRecentTransfers().map((transfer) => {
                          const amount = typeof transfer.details === 'object' && transfer.details && 'amount' in transfer.details 
                            ? Number(transfer.details.amount) || 0 
                            : 0;
                          
                          return (
                            <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                              <div className="flex items-center gap-3">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <div>
                                  <p className="text-sm font-medium">
                                    ${amount.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transfer.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {transfer.action.replace('secure_deposit_', '')}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {pendingAccounts.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have {pendingAccounts.length} bank account{pendingAccounts.length === 1 ? '' : 's'} pending verification. 
                    Complete verification to enable secure transfers.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Bank Accounts</h3>
                {bankAccounts.length > 0 && bankAccounts.length < 3 && (
                  <Button onClick={() => setActiveTab('accounts')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                )}
              </div>

              {bankAccounts.length === 0 ? (
                <BankAccountForm onAccountCreated={handleAccountCreated} />
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <Card key={account.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{account.account_holder_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {account.bank_name} • ****{account.account_number_last4}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(account.created_at).toLocaleDateString()}
                            </p>
                            {account.updated_by_user_at && (
                              <p className="text-xs text-orange-600">
                                Updated {new Date(account.updated_by_user_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusBadge(account.verification_status)}>
                              {account.verification_status}
                            </Badge>
                            {account.verification_status === 'verified' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccountForUpdate(account);
                                  setActiveTab('update');
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Update
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {bankAccounts.length < 3 && (
                    <BankAccountForm onAccountCreated={handleAccountCreated} />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <h3 className="text-lg font-semibold">Account Verification</h3>
              {pendingAccounts.length === 0 ? (
                <div className="text-center p-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">All accounts are verified!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAccounts.map((account) => (
                    <BankAccountVerification
                      key={account.id}
                      bankAccount={account}
                      onVerificationComplete={handleVerificationComplete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="transfer" className="space-y-4">
              <h3 className="text-lg font-semibold">Secure Transfer to Bank Account</h3>
              {verifiedAccounts.length === 0 ? (
                <Card>
                  <CardContent className="text-center p-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No verified accounts available</p>
                    <p className="text-sm text-muted-foreground">
                      You must verify at least one bank account before processing transfers
                    </p>
                    <Button 
                      onClick={() => setActiveTab('accounts')} 
                      className="mt-4"
                      variant="outline"
                    >
                      Add & Verify Account
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <SecureDepositForm
                  currentBalance={currentBalance}
                  verifiedAccounts={verifiedAccounts}
                  userEmail={userEmail}
                  userId={userId}
                  onDepositSuccess={handleDepositSuccess}
                />
              )}
            </TabsContent>

            <TabsContent value="update" className="space-y-4">
              <h3 className="text-lg font-semibold">Update Bank Account Information</h3>
              {!selectedAccountForUpdate ? (
                <Card>
                  <CardContent className="text-center p-8">
                    <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No account selected for update</p>
                    <p className="text-sm text-muted-foreground">
                      Select an account from the Accounts tab to update its information
                    </p>
                    <Button 
                      onClick={() => setActiveTab('accounts')} 
                      className="mt-4"
                      variant="outline"
                    >
                      Go to Accounts
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <BankAccountUpdateForm
                  bankAccount={selectedAccountForUpdate}
                  onUpdateComplete={handleAccountUpdated}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <h3 className="text-lg font-semibold">Transfer History & Security Audit</h3>
              {auditLog.length === 0 ? (
                <div className="text-center p-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transfer history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLog.slice(0, 20).map((log) => {
                    const amount = typeof log.details === 'object' && log.details && 'amount' in log.details 
                      ? Number(log.details.amount) || 0 
                      : 0;
                    const verificationConfirmed = typeof log.details === 'object' && log.details && 'verification_confirmed' in log.details 
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureBankTransferDashboard;
