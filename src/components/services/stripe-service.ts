// Persian Connect - Stripe Payment Service
// 
// This service handles payment processing for:
// - Ad posting: $2.00 USD for 30 days
// - Ad boost (optional): +$10.00 USD for 1 week featured placement

export interface AdData {
  category: string;
  subcategory: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  unit: string;
  negotiable: boolean;
  country: string;
  city: string;
  images: File[];
  video: File | null;
}

export interface PaymentSession {
  sessionId: string;
  url: string;
  paymentId?: string;
}

export interface PaymentOptions {
  includeBoost: boolean;
}

// Pricing configuration
const PRICING = {
  AD_POSTING: 200, // $2.00 in cents
  AD_BOOST: 1000,  // $10.00 in cents
  AD_DURATION_DAYS: 30,
  BOOST_DURATION_DAYS: 7
};

export class StripeService {
  private static instance: StripeService;

  private constructor() {}

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Creates a checkout session for ad posting with optional boost
   */
  async createCheckoutSession(
    adData: AdData, 
    options: PaymentOptions = { includeBoost: false }
  ): Promise<PaymentSession> {
    try {
      // Calculate total amount
      let totalAmount = PRICING.AD_POSTING;
      const lineItems = [{
        name: 'Ad Posting - 30 Days',
        description: `Post your ad: "${adData.title}" for 30 days`,
        amount: PRICING.AD_POSTING,
        quantity: 1
      }];

      if (options.includeBoost) {
        totalAmount += PRICING.AD_BOOST;
        lineItems.push({
          name: 'Featured Boost - 7 Days',
          description: 'Boost your ad to featured status for 1 week',
          amount: PRICING.AD_BOOST,
          quantity: 1
        });
      }

      // Get authentication
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Authentication error:', sessionError.message);
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      if (!session || !session.access_token) {
        console.error('❌ No valid session found');
        throw new Error('Please sign in to continue with payment.');
      }

      // Call backend to create checkout session
      const { projectId } = await import('../../utils/supabase/info');
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741`;
      
      const requestData = {
        adData,
        totalAmount,
        includeBoost: options.includeBoost,
        lineItems
      };

      console.log('🔄 Creating checkout session...', {
        totalAmount: this.formatPrice(totalAmount),
        includeBoost: options.includeBoost
      });

      const response = await fetch(`${baseUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment API error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        
        throw new Error(`Payment service error: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Checkout session created successfully');
      
      return {
        sessionId: result.sessionId,
        url: result.url,
        paymentId: result.paymentId
      };
      
    } catch (error) {
      console.error('❌ Failed to create checkout session:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication') || error.message.includes('sign in')) {
          throw new Error('Please sign in to continue with payment.');
        }
        throw error;
      }
      
      throw new Error('Failed to initialize payment. Please try again.');
    }
  }

  /**
   * Redirects to Stripe checkout page using the URL from createCheckoutSession
   */
  async redirectToCheckout(checkoutUrl: string, sessionId: string): Promise<void> {
    try {
      console.log('🔄 Redirecting to Stripe checkout...', sessionId);
      
      // Validate that we have a proper Stripe checkout URL
      if (!checkoutUrl || (!checkoutUrl.startsWith('https://checkout.stripe.com') && !checkoutUrl.startsWith('https://checkout.stripe.dev'))) {
        throw new Error('Invalid checkout URL received');
      }
      
      // Store session for when user returns
      localStorage.setItem('pendingPaymentSessionId', sessionId);
      
      // Redirect to actual Stripe checkout
      console.log('✅ Redirecting to Stripe:', checkoutUrl);
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('❌ Checkout redirect failed:', error);
      throw new Error('Failed to process payment. Please try again.');
    }
  }

  /**
   * Creates a checkout session specifically for boosting an existing ad
   */
  async createBoostCheckoutSession(adId: string, adTitle: string): Promise<PaymentSession> {
    try {
      console.log('🚀 Creating boost checkout session for ad:', adId);

      // Get authentication
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Authentication error:', sessionError.message);
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      if (!session || !session.access_token) {
        console.error('❌ No valid session found');
        throw new Error('Please sign in to boost your ad.');
      }

      // Call backend to create boost checkout session
      const { projectId } = await import('../../utils/supabase/info');
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741`;
      
      const requestData = {
        adId,
        adTitle,
        amount: PRICING.AD_BOOST, // $10.00 in cents
        type: 'ad_boost'
      };

      console.log('🔄 Creating boost checkout session...', {
        adId,
        amount: this.formatPrice(PRICING.AD_BOOST)
      });

      const response = await fetch(`${baseUrl}/payments/create-boost-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Boost payment API error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        
        throw new Error(`Boost payment service error: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Boost checkout session created successfully');
      
      return {
        sessionId: result.sessionId,
        url: result.url,
        paymentId: result.paymentId
      };
      
    } catch (error) {
      console.error('❌ Failed to create boost checkout session:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication') || error.message.includes('sign in')) {
          throw new Error('Please sign in to boost your ad.');
        }
        throw error;
      }
      
      throw new Error('Failed to initialize boost payment. Please try again.');
    }
  }

  /**
   * Formats price from cents to USD string
   */
  formatPrice(cents: number): string {
    return `${(cents / 100).toFixed(2)}`;
  }

  /**
   * Gets pricing information
   */
  getPricing() {
    return {
      adPosting: {
        amount: PRICING.AD_POSTING,
        formatted: this.formatPrice(PRICING.AD_POSTING),
        duration: `${PRICING.AD_DURATION_DAYS} days`
      },
      adBoost: {
        amount: PRICING.AD_BOOST,
        formatted: this.formatPrice(PRICING.AD_BOOST),
        duration: `${PRICING.BOOST_DURATION_DAYS} days`
      },
      total: (includeBoost: boolean) => {
        const total = PRICING.AD_POSTING + (includeBoost ? PRICING.AD_BOOST : 0);
        return {
          amount: total,
          formatted: this.formatPrice(total)
        };
      }
    };
  }

  /**
   * Validates payment options
   */
  validatePaymentOptions(options: PaymentOptions): boolean {
    return typeof options.includeBoost === 'boolean';
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();