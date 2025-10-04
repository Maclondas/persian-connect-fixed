import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { XCircle, ArrowLeft, CreditCard, Star } from 'lucide-react';

interface BoostFailedPageProps {
  onNavigate: (page: string) => void;
}

export function BoostFailedPage({ onNavigate }: BoostFailedPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Boost Failed</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your ad boost payment was not completed. No charges have been made to your account.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">About Ad Boost</h3>
            </div>
            <p className="text-sm text-blue-800">
              Boost your ad for $10 to feature it at the top of search results for 7 days and get more visibility.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Common reasons for payment failure:</h3>
            <ul className="text-sm text-gray-700 space-y-1 text-left">
              <li>• Insufficient funds</li>
              <li>• Payment method declined</li>
              <li>• Session timeout</li>
              <li>• Network connection issues</li>
            </ul>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => onNavigate('my-ads')} 
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('home')} 
              className="flex-1"
            >
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}