
import { supabase } from '@/integrations/supabase/client';

export interface TaskPaymentRequest {
  taskType: string;
  amount: number;
  description: string;
  userId: string;
  userEmail: string;
}

export interface TaskPaymentResponse {
  success: boolean;
  data?: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
  };
  error?: string;
  timestamp: string;
}

class TaskPaymentService {
  async createTaskPayment(request: TaskPaymentRequest): Promise<TaskPaymentResponse> {
    try {
      console.log('Creating task payment:', request);
      
      const { data, error } = await supabase.functions.invoke('create-task-payment', {
        body: {
          amount: Math.round(request.amount * 100), // Convert to cents
          description: `Task Payment: ${request.description}`,
          taskType: request.taskType,
          userId: request.userId,
          customerEmail: request.userEmail,
        },
      });

      if (error) {
        throw new Error(error.message || 'Task payment creation failed');
      }

      return data;
    } catch (error) {
      console.error('Task Payment Creation Error:', error);
      throw error;
    }
  }

  async verifyTaskPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { paymentIntentId },
      });

      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }

      return data.success && data.data?.confirmed;
    } catch (error) {
      console.error('Payment Verification Error:', error);
      return false;
    }
  }
}

export const taskPaymentService = new TaskPaymentService();
