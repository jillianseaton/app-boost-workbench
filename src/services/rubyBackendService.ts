import { z } from "zod";

const RUBY_BACKEND_URL = import.meta.env.VITE_RUBY_BACKEND_URL || 'http://localhost:4242';

const healthCheckResponseSchema = z.object({
  status: z.string(),
});

const checkoutSessionSchema = z.object({
  success: z.boolean(),
  data: z.object({
    url: z.string().url()
  }).optional(),
  error: z.string().optional()
});

export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionSchema>;

interface CheckoutSessionRequest {
  amount: number; // Amount in cents
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  mode?: 'payment' | 'setup';
}

export interface StripePayoutRequest {
  amount: number;
}

export const rubyBackendService = {
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${RUBY_BACKEND_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return healthCheckResponseSchema.parse(data);
    } catch (error) {
      console.error("Health check failed", error);
      return { status: "down" };
    }
  },

  async createCheckoutSession(request: CheckoutSessionRequest) {
    try {
      console.log('Calling Ruby backend for checkout session:', request);
      
      const response = await fetch(`${RUBY_BACKEND_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          description: request.description,
          success_url: request.successUrl,
          cancel_url: request.cancelUrl,
          customer_email: request.customerEmail,
          mode: request.mode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ruby backend response:', data);
      
      return {
        success: true,
        data: {
          url: data.url
        }
      };
    } catch (error) {
      console.error('Ruby backend error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
