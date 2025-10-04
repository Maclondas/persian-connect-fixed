import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { XCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentFailedPageProps {
  onNavigate: (page: string) => void;
}

export function PaymentFailedPage({ onNavigate }: PaymentFailedPageProps) {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupComplete, setCleanupComplete] = useState(false);

  useEffect(() => {
    // Handle cleanup when the page loads
    const handlePaymentFailure = async () => {
      try {
        setIsCleaningUp(true);
        
        // Get stored context
        const pendingAdId = localStorage.getItem('pendingAdId');
        const pendingPaymentId = localStorage.getItem('pendingPaymentId');
        const sessionId = localStorage.getItem('paymentSessionId') || new URLSearchParams(window.location.search).get('session_id');
        
        if (pendingAdId && pendingPaymentId) {
          console.log('🧹 Cleaning up failed payment:', { pendingAdId, pendingPaymentId, sessionId });
          
          // Call the cleanup endpoint
          const { projectId } = await import('../utils/supabase/info');
          const { getSupabaseClient } = await import('../utils/supabase/client');
          const supabase = getSupabaseClient();
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session || !session.access_token) {
            console.error('❌ Authentication error during cleanup');
            return;
          }

          const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741`;
          const response = await fetch(`${baseUrl}/payments/handle-failure`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              sessionId,
              paymentId: pendingPaymentId,
              adId: pendingAdId,
              reason: 'payment_cancelled'
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Payment failure cleanup successful:', result);
            setCleanupComplete(true);
            
            // Clean up localStorage
            localStorage.removeItem('pendingAdId');
            localStorage.removeItem('pendingPaymentId');
            localStorage.removeItem('paymentSessionId');
          } else {
            console.error('❌ Payment failure cleanup failed');
          }
        }
      } catch (error) {
        console.error('❌ Error during payment failure cleanup:', error);
      } finally {
        setIsCleaningUp(false);
      }
    };

    handlePaymentFailure();
  }, []);

  if (isCleaningUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing...</h2>
            <p className="text-gray-600">Cleaning up after payment cancellation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment could not be processed. This could be due to:
          </p>
          
          <ul className="text-left space-y-2 text-sm text-gray-600">
            <li>• Insufficient funds</li>
            <li>• Card was declined</li>
            <li>• Payment was cancelled</li>
            <li>• Network connectivity issues</li>
          </ul>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              <strong>{cleanupComplete ? 'No charges applied.' : 'Don\'t worry!'}</strong> {cleanupComplete 
                ? 'Your payment was cancelled and no ad was posted.' 
                : 'Your ad information has been saved and you can try again.'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => onNavigate('post-ad')}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ad
            </Button>
            
            <Button
              onClick={() => onNavigate('post-ad')}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 pt-4">
            Need help? Contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}