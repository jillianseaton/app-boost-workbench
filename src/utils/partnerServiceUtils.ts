
import { PartnerService } from '@/types/partnerService';

export const calculateCommission = (price: number, rate: number): string => {
  return (price * rate).toFixed(2);
};

export const formatPrice = (service: PartnerService): string => {
  const period = service.billingPeriod === 'monthly' ? '/mo' : 
                 service.billingPeriod === 'yearly' ? '/year' : '';
  return `$${service.price}${period}`;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Entertainment': 'bg-purple-100 text-purple-800',
    'E-commerce': 'bg-green-100 text-green-800',
    'Web Hosting': 'bg-blue-100 text-blue-800',
    'Education': 'bg-orange-100 text-orange-800',
    'Design': 'bg-pink-100 text-pink-800',
    'Health & Fitness': 'bg-red-100 text-red-800',
    'Shopping': 'bg-yellow-100 text-yellow-800',
    'Productivity': 'bg-indigo-100 text-indigo-800',
    'Flowers & Gifts': 'bg-rose-100 text-rose-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};
