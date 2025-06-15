import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Banknote, History, AlertTriangle, CheckCircle, Plus, Edit } from 'lucide-react';
import { secureBankService, BankAccount } from '@/services/secureBankService';
import { useToast } from '@/hooks/use-toast';
import BankAccountForm from './BankAccountForm';
import BankAccountVerification from './BankAccountVerification';
import SecureDepositForm from './SecureDepositForm';
import BankAccountUpdateForm from './BankAccountUpdateForm';

interface SecureBankDashboardProps {
  currentBalance: number;
  onDepositSuccess: (amount: number) => void;
  userEmail: string;
  userId: string;
}

const SecureBankDashboard: React.FC<SecureBankDashboardProps> = ({
  currentBalance,
  onDepositSuccess,
  userEmail,
  userId,
}) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');
  const [selectedAccountForUpdate, setSelectedAccountForUpdate] = useState<BankAccount | null>(null);
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
  };

  const handleDepositSuccess = (amount: number) => {
    onDepositSuccess(amount);
    loadAuditLog();
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading secure bank dashboard...</p>
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
            <Shield className="h-5 w-5 text-green-500" />
            Secure Bank Transfer Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-800">{verifiedAccounts.length}</p>
              <p className="text-sm text-green-600">Verified Accounts</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Banknote className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold text-blue-800">${currentBalance.toFixed(2)}</p>
              <p className="text-sm text-blue-600">Available Balance</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="font-semibold text-orange-800">{pendingAccounts.length}</p>
              <p className="text-sm text-orange-600">Pending Verification</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="update">Update</TabsTrigger>
              <TabsTrigger value="deposit">Secure Deposit</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Bank Accounts</h3>
                {bankAccounts.length === 0 && (
                  <Button onClick={() => setActiveTab('verification')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Account
                  </Button>
                )}
              </div>

              {bankAccounts.length === 0 ? (
                <BankAccountForm onAccountCreated={handleAccountCreated} />
              ) : (
                <div className="space-y-4">
                  {bankAccounts.length > 0 && (
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

            <TabsContent value="deposit" className="space-y-4">
              <h3 className="text-lg font-semibold">Secure Deposit to Verified Account</h3>
              {verifiedAccounts.length === 0 ? (
                <Card>
                  <CardContent className="text-center p-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No verified accounts available</p>
                    <p className="text-sm text-muted-foreground">
                      You must verify at least one bank account before processing deposits
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

            <TabsContent value="history" className="space-y-4">
              <h3 className="text-lg font-semibold">Security Audit Log</h3>
              {auditLog.length === 0 ? (
                <div className="text-center p-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLog.slice(0, 10).map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                          {log.details?.amount && (
                            <Badge variant="outline">
                              ${log.details.amount.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureBankDashboard;
