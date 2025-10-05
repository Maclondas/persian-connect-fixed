import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Home, Receipt, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { realDataService as dataService } from './services/real-data-service';

interface PaymentSuccessPageProps {
  onNavigate: (page: string) => void;
}

export function PaymentSuccessPage({ onNavigate }: PaymentSuccessPageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const verifyPayment = useCallback(async (sessionId: string) => {
    try {
      console.log('🔍 Verifying payment for session:', sessionId);
      
      // Get stored context
      const pendingAdId = localStorage.getItem('pendingAdId');
      const pendingPaymentId = localStorage.getItem('pendingPaymentId');
      
      if (!pendingAdId || !pendingPaymentId) {
        throw new Error('Payment context not found');
      }

      // Verify payment with backend using real Stripe session
      const { projectId } = await import('../utils/supabase/info');
      const { getSupabaseClient } = await import('../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.access_token) {
        throw new Error('Authentication required');
      }

      // Call backend to verify the Stripe payment
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741`;
      const response = await fetch(`${baseUrl}/payments/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sessionId,
          paymentId: pendingPaymentId,
          adId: pendingAdId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment verification failed: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.verified) {
        toast.success('Payment confirmed! Your ad is being processed...');
        setIsProcessing(false);
        
        // Clean up localStorage after successful payment
        localStorage.removeItem('pendingAdId');
        localStorage.removeItem('pendingPaymentId');
        localStorage.removeItem('pendingPaymentSessionId');
      } else {
        throw new Error('Payment verification failed');
      }
      
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      toast.error('Payment verification failed');
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    // Get session ID from URL parameter (Stripe redirects with session_id)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      verifyPayment(sessionIdParam);
    } else {
      // Fallback: check localStorage for pending session
      const pendingSessionId = localStorage.getItem('pendingPaymentSessionId');
      if (pendingSessionId) {
        setSessionId(pendingSessionId);
        verifyPayment(pendingSessionId);
      } else {
        toast.error('Payment session not found');
        setTimeout(() => onNavigate('home'), 3000);
      }
    }
  }, [onNavigate, verifyPayment]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment of <strong>$2.00 USD</strong> has been processed successfully.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Ad Under Review</span>
            </div>
            <p className="text-sm text-blue-700">
              Your ad is being reviewed by our AI moderation system for quality and safety. 
              This usually takes just a few minutes.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">What happens next?</span>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• AI review: Usually completed within 5 minutes</p>
              <p>• If approved: Your ad goes live immediately</p>
              <p>• If flagged: Admin review (up to 24 hours)</p>
              <p>• Ad duration: 30 days from approval</p>
            </div>
          </div>
          
          {sessionId && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Transaction ID:</p>
              <p className="text-xs font-mono text-gray-700 break-all">{sessionId}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => onNavigate('my-ads')}
              variant="outline"
              className="flex-1"
            >
              <Receipt className="h-4 w-4 mr-2" />
              View My Ads
            </Button>
            
            <Button
              onClick={() => onNavigate('home')}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 pt-4">
            You will receive an email confirmation shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}