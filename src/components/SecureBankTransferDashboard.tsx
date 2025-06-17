
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Edit
} from 'lucide-react';
import { secureBankService, BankAccount } from '@/services/secureBankService';
import { useToast } from '@/hooks/use-toast';
import BankAccountForm from './BankAccountForm';
import BankAccountVerification from './BankAccountVerification';
import SecureDepositForm from './SecureDepositForm';
import BankAccountUpdateForm from './BankAccountUpdateForm';
import OverviewStats from './secure-bank/OverviewStats';
import QuickActions from './secure-bank/QuickActions';
import RecentTransfers from './secure-bank/RecentTransfers';
import BankAccountsList from './secure-bank/BankAccountsList';
import AuditHistory from './secure-bank/AuditHistory';

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
          const amount = typeof entry.details === 'object' && 
                        entry.details && 
                        typeof entry.details === 'object' && 
                        'amount' in entry.details 
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

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleUpdateAccount = (account: BankAccount) => {
    setSelectedAccountForUpdate(account);
    setActiveTab('update');
  };

  const verifiedAccounts = bankAccounts.filter(account => account.verification_status === 'verified');
  const pendingAccounts = bankAccounts.filter(account => account.verification_status !== 'verified');

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
              <OverviewStats
                currentBalance={currentBalance}
                verifiedAccountsCount={verifiedAccounts.length}
                totalTransferred={transferStats.totalTransferred}
                completedTransfers={transferStats.completedTransfers}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickActions
                  verifiedAccountsCount={verifiedAccounts.length}
                  pendingAccountsCount={pendingAccounts.length}
                  onNavigateToTab={handleNavigateToTab}
                />

                <RecentTransfers transfers={getRecentTransfers()} />
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
                  <BankAccountsList
                    bankAccounts={bankAccounts}
                    onUpdateAccount={handleUpdateAccount}
                  />
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
              <AuditHistory auditLog={auditLog} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureBankTransferDashboard;
