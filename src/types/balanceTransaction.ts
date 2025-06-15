
export interface BalanceTransaction {
  id: string;
  object: 'balance_transaction';
  amount: number;
  available_on: number;
  created: number;
  currency: string;
  description?: string;
  exchange_rate?: number;
  fee: number;
  fee_details: FeeDetail[];
  net: number;
  reporting_category: string;
  source: string;
  status: 'available' | 'pending' | 'in_transit';
  type: 'charge' | 'refund' | 'adjustment' | 'application_fee' | 'application_fee_refund' | 'transfer' | 'payment' | 'payout' | 'payment_failure_refund' | 'stripe_fee' | 'tax';
}

export interface FeeDetail {
  amount: number;
  currency: string;
  description: string;
  type: string;
}

export interface BalanceTransactionFilters {
  type?: string;
  status?: string;
  reporting_category?: string;
  created_gte?: number;
  created_lte?: number;
  available_on_gte?: number;
  available_on_lte?: number;
}

export interface BalanceTransactionListResponse {
  object: 'list';
  data: BalanceTransaction[];
  has_more: boolean;
  url: string;
}
