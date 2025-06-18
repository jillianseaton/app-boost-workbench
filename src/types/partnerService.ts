
export interface PartnerService {
  id: string;
  name: string;
  product: string;
  price: number;
  originalPrice?: number;
  affiliateUrl: string;
  commissionRate: number;
  category: string;
  description: string;
  features: string[];
  rating: number;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  popularBadge?: boolean;
  partnerType: 'streaming' | 'software' | 'hosting' | 'education' | 'fitness' | 'design' | 'flowers';
  cjAffiliateId?: string;
  epc?: string;
}
