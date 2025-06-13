
import { supabase } from '@/integrations/supabase/client';

export interface PrefilledAccountData {
  // Basic account info
  email: string;
  country: string;
  accountType: 'express' | 'custom' | 'standard';
  
  // Business profile
  businessName?: string;
  productDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  websiteUrl?: string;
  merchantCategoryCode?: string;
  
  // Company information
  companyName?: string;
  taxId?: string;
  companyPhone?: string;
  businessAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Individual information (for sole proprietors)
  firstName?: string;
  lastName?: string;
  dateOfBirth?: {
    day: number;
    month: number;
    year: number;
  };
  personalAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Bank account information
  bankAccount?: {
    accountHolderName: string;
    accountHolderType: 'individual' | 'company';
    routingNumber: string;
    accountNumber: string;
    currency: string;
  };
  
  // Business type
  businessType: 'individual' | 'company';
  
  // Metadata
  userId?: string;
  platformSource?: string;
}

export interface ConnectedAccountResponse {
  success: boolean;
  data?: {
    accountId: string;
    onboardingRequired: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requirementsCurrentlyDue: string[];
    detailsSubmitted: boolean;
    accountLinkUrl?: string;
  };
  error?: string;
  timestamp: string;
}

class StripeConnectedAccountService {
  async createExpressAccount(accountData: PrefilledAccountData): Promise<ConnectedAccountResponse> {
    try {
      console.log('Creating Express account with prefilled data:', accountData);
      
      const { data, error } = await supabase.functions.invoke('create-prefilled-express-account', {
        body: accountData,
      });

      if (error) {
        throw new Error(error.message || 'Express account creation failed');
      }

      return data;
    } catch (error) {
      console.error('Express Account Creation Error:', error);
      throw error;
    }
  }

  async createCustomAccount(accountData: PrefilledAccountData): Promise<ConnectedAccountResponse> {
    try {
      console.log('Creating Custom account with prefilled data:', accountData);
      
      const { data, error } = await supabase.functions.invoke('create-prefilled-custom-account', {
        body: accountData,
      });

      if (error) {
        throw new Error(error.message || 'Custom account creation failed');
      }

      return data;
    } catch (error) {
      console.error('Custom Account Creation Error:', error);
      throw error;
    }
  }

  async createStandardAccount(accountData: PrefilledAccountData): Promise<ConnectedAccountResponse> {
    try {
      console.log('Creating Standard account with prefilled data:', accountData);
      
      const { data, error } = await supabase.functions.invoke('create-prefilled-standard-account', {
        body: accountData,
      });

      if (error) {
        throw new Error(error.message || 'Standard account creation failed');
      }

      return data;
    } catch (error) {
      console.error('Standard Account Creation Error:', error);
      throw error;
    }
  }

  async updateAccountWithPrefill(accountId: string, updates: Partial<PrefilledAccountData>): Promise<ConnectedAccountResponse> {
    try {
      console.log('Updating account with prefilled data:', accountId, updates);
      
      const { data, error } = await supabase.functions.invoke('update-prefilled-account', {
        body: { accountId, ...updates },
      });

      if (error) {
        throw new Error(error.message || 'Account update failed');
      }

      return data;
    } catch (error) {
      console.error('Account Update Error:', error);
      throw error;
    }
  }
}

export const stripeConnectedAccountService = new StripeConnectedAccountService();
