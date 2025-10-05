import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Home, Receipt, Clock, Shield, Star } from 'lucide-react';
import { toast } from 'sonner';
import { realDataService as dataService } from './services/real-data-service';

interface BoostSuccessPageProps {
  onNavigate: (page: string) => void;
}

export function BoostSuccessPage({ onNavigate }: BoostSuccessPageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const verifyBoostPayment = useCallback(async (sessionId: string) => {
    try {
      // Get stored context
      const pendingPaymentId = localStorage.getItem('paymentId');
      const pendingAdId = localStorage.getItem('adId');
      
      if (!pendingPaymentId || !pendingAdId) {
        throw new Error('Missing payment context');
      }

      console.log('🔍 Verifying boost payment:', {
        sessionId,
        paymentId: pendingPaymentId,
        adId: pendingAdId
      });

      // Use the server payment verification which handles boost payments correctly
      const result = await dataService.verifyPaymentSession(sessionId, pendingPaymentId, pendingAdId);
      
      console.log('📋 Payment verification result:', result);
      
      if (result.verified) {
        console.log('✅ Boost payment verified successfully:', result);
        
        // Check if ad was actually updated
        if (result.ad && result.ad.featured) {
          console.log('🌟 Ad successfully marked as featured:', {
            adId: result.ad.id,
            featured: result.ad.featured,
            featuredUntil: result.ad.featuredUntil
          });
          toast.success('🌟 Your ad has been boosted successfully and is now featured!');
        } else {
          console.warn('⚠️ Payment verified but ad not marked as featured:', result.ad);
          toast.success('Payment processed successfully, but ad status may need manual verification.');
        }
        
        // Clean up localStorage
        localStorage.removeItem('paymentId');
        localStorage.removeItem('adId');
        localStorage.removeItem('paymentSessionId');
        localStorage.removeItem('completedPaymentSessionId');
      } else {
        console.error('❌ Payment verification failed:', result);
        throw new Error(result.error || 'Payment verification failed');
      }
      
    } catch (error) {
      console.error('Failed to verify boost payment:', error);
      toast.error(`Failed to complete boost: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    // Get session ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session_id');
    const storedSessionId = localStorage.getItem('completedPaymentSessionId');
    
    const finalSessionId = urlSessionId || storedSessionId;
    
    if (finalSessionId) {
      setSessionId(finalSessionId);
      verifyBoostPayment(finalSessionId);
    } else {
      setIsProcessing(false);
      toast.error('No payment session found');
    }
  }, [verifyBoostPayment]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl text-green-600">
            {isProcessing ? 'Processing Boost...' : 'Boost Successful!'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {isProcessing ? (
            <p className="text-gray-600">
              Please wait while we activate your ad boost...
            </p>
          ) : (
            <>
              <p className="text-gray-600">
                Your payment of <strong>$10.00 USD</strong> has been processed successfully.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="font-semibold text-blue-900">Ad Boosted!</h3>
                </div>
                <p className="text-sm text-blue-800">
                  Your ad is now featured and will appear at the top of search results for the next 7 days.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-900">Boost Duration</h3>
                </div>
                <p className="text-sm text-yellow-800">
                  Your featured status will automatically expire after 1 week. You can boost your ad again at any time.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Receipt className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">What happens next?</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Your ad appears at the top of category listings</li>
                  <li>• Increased visibility to potential buyers</li>
                  <li>• Featured badge on your ad</li>
                  <li>• Automatic expiration after 7 days</li>
                </ul>
              </div>
            </>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => onNavigate('my-ads')} 
              className="flex-1"
              disabled={isProcessing}
            >
              <Receipt className="h-4 w-4 mr-2" />
              My Ads
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('home')} 
              className="flex-1"
              disabled={isProcessing}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}