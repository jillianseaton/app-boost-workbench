
import { supabase } from '@/integrations/supabase/client';

export interface AccountMonitoringData {
  accountId: string;
  state: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  accountType: string;
  country: string;
  defaultCurrency: string;
  businessType: string;
  created: number;
  email: string;
  
  capabilities: {
    cardPayments: string;
    transfers: string;
    legacyPayments?: string;
  };
  
  businessProfile?: {
    name?: string;
    productDescription?: string;
    supportEmail?: string;
    supportPhone?: string;
    url?: string;
    mcc?: string;
  };
  
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    disabledReason?: string;
    currentDeadline?: number;
    alternativelyDue: string[];
    errors: any[];
  };
  
  externalAccounts: number;
  hasExternalAccount: boolean;
  
  settings?: {
    payouts: any;
    payments: any;
    branding: any;
  };
  
  tosAcceptance?: {
    date: number;
    ip: string;
    userAgent: string;
  };
}

export interface AccountMonitoringResponse {
  success: boolean;
  data?: AccountMonitoringData;
  error?: string;
  message?: string;
  timestamp: string;
}

class StripeAccountMonitorService {
  async getAccountStatus(accountId: string): Promise<AccountMonitoringResponse> {
    try {
      console.log('Monitoring account status for:', accountId);
      
      const { data, error } = await supabase.functions.invoke('get-account-requirements', {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to retrieve account status');
      }

      // Log monitoring information
      if (data.success && data.data) {
        console.log('Account Status Summary:');
        console.log('- Account ID:', data.data.accountId);
        console.log('- State:', data.data.state);
        console.log('- Charges Enabled:', data.data.chargesEnabled);
        console.log('- Payouts Enabled:', data.data.payoutsEnabled);
        console.log('- Details Submitted:', data.data.detailsSubmitted);
        console.log('- Requirements Currently Due:', data.data.requirements.currentlyDue);
        console.log('- Requirements Past Due:', data.data.requirements.pastDue);
        console.log('- Has External Account:', data.data.hasExternalAccount);
      }

      return data;
    } catch (error) {
      console.error('Account Status Monitoring Error:', error);
      throw error;
    }
  }

  async monitorAccountHealth(accountId: string): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
    data?: AccountMonitoringData;
  }> {
    try {
      const response = await this.getAccountStatus(accountId);
      
      if (!response.success || !response.data) {
        return {
          isHealthy: false,
          issues: ['Unable to retrieve account status'],
          recommendations: ['Check account ID and try again'],
        };
      }

      const account = response.data;
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check for critical issues
      if (!account.chargesEnabled) {
        issues.push('Charges are disabled');
        recommendations.push('Complete required verification steps to enable charges');
      }

      if (!account.payoutsEnabled) {
        issues.push('Payouts are disabled');
        recommendations.push('Add bank account and complete verification to enable payouts');
      }

      if (account.requirements.pastDue.length > 0) {
        issues.push(`${account.requirements.pastDue.length} past due requirements`);
        recommendations.push('Immediately address past due requirements to avoid account restrictions');
      }

      if (account.requirements.currentlyDue.length > 0) {
        issues.push(`${account.requirements.currentlyDue.length} requirements currently due`);
        recommendations.push('Complete currently due requirements to maintain account status');
      }

      if (!account.hasExternalAccount) {
        issues.push('No bank account connected');
        recommendations.push('Add a bank account to receive payouts');
      }

      if (!account.detailsSubmitted) {
        issues.push('Account setup incomplete');
        recommendations.push('Complete the account onboarding process');
      }

      // Check for warnings
      if (account.requirements.eventuallyDue.length > 0) {
        recommendations.push(`${account.requirements.eventuallyDue.length} requirements will be due in the future - plan ahead`);
      }

      if (account.requirements.pendingVerification.length > 0) {
        recommendations.push(`${account.requirements.pendingVerification.length} items pending verification - this may take time`);
      }

      const isHealthy = issues.length === 0 && account.chargesEnabled && account.payoutsEnabled;

      return {
        isHealthy,
        issues,
        recommendations,
        data: account,
      };
    } catch (error) {
      console.error('Account Health Monitoring Error:', error);
      return {
        isHealthy: false,
        issues: ['Error checking account health'],
        recommendations: ['Try again later or contact support'],
      };
    }
  }

  getStateDescription(state: string): string {
    const descriptions: Record<string, string> = {
      'complete': 'Account is fully verified and operational',
      'enabled': 'Account is enabled but may have future requirements',
      'restricted': 'Account has restrictions that need to be resolved',
      'restricted (payouts disabled)': 'Account can accept payments but payouts are disabled',
      'restricted (charges disabled)': 'Account can receive payouts but cannot accept charges',
      'restricted (past due)': 'Account has past due requirements causing restrictions',
      'pending enablement': 'Account is pending final verification for full enablement',
      'pending (disabled)': 'Account is disabled pending verification',
      'rejected': 'Account has been rejected and cannot be used',
    };

    return descriptions[state] || 'Unknown account state';
  }

  getRequirementDescription(requirement: string): string {
    const descriptions: Record<string, string> = {
      'business_profile.mcc': 'Merchant Category Code needs to be provided',
      'business_profile.name': 'Business name needs to be provided',
      'business_profile.product_description': 'Business description needs to be provided',
      'business_profile.support_email': 'Support email needs to be provided',
      'business_profile.support_phone': 'Support phone number needs to be provided',
      'business_profile.url': 'Business website URL needs to be provided',
      'external_account': 'Bank account needs to be added',
      'individual.address.city': 'Individual address city needs to be provided',
      'individual.address.line1': 'Individual address line 1 needs to be provided',
      'individual.address.postal_code': 'Individual address postal code needs to be provided',
      'individual.address.state': 'Individual address state needs to be provided',
      'individual.dob.day': 'Individual date of birth (day) needs to be provided',
      'individual.dob.month': 'Individual date of birth (month) needs to be provided',
      'individual.dob.year': 'Individual date of birth (year) needs to be provided',
      'individual.email': 'Individual email needs to be provided',
      'individual.first_name': 'Individual first name needs to be provided',
      'individual.last_name': 'Individual last name needs to be provided',
      'individual.phone': 'Individual phone number needs to be provided',
      'individual.ssn_last_4': 'Last 4 digits of SSN needs to be provided',
      'individual.verification.document': 'Identity verification document needs to be uploaded',
      'company.address.city': 'Company address city needs to be provided',
      'company.address.line1': 'Company address line 1 needs to be provided',
      'company.address.postal_code': 'Company address postal code needs to be provided',
      'company.address.state': 'Company address state needs to be provided',
      'company.name': 'Company name needs to be provided',
      'company.phone': 'Company phone number needs to be provided',
      'company.tax_id': 'Company tax ID (EIN) needs to be provided',
      'company.verification.document': 'Company verification document needs to be uploaded',
      'tos_acceptance.date': 'Terms of service need to be accepted',
    };

    return descriptions[requirement] || requirement.replace(/_/g, ' ').replace(/\./g, ' > ');
  }
}

export const stripeAccountMonitorService = new StripeAccountMonitorService();
