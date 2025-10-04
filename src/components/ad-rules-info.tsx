import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Shield, CreditCard, CheckCircle } from 'lucide-react';

export function AdRulesInfo() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Ad Posting Rules & Process
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              <strong>Payment Required:</strong> All ads require a $2.00 posting fee before they can be reviewed and published.
            </AlertDescription>
          </Alert>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>AI Moderation:</strong> Your ad will be automatically reviewed by our AI system for quality and safety.
            </AlertDescription>
          </Alert>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>30-Day Duration:</strong> All ads automatically expire after 30 days and will be removed from the platform.
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Login Required:</strong> You must be logged in to post advertisements on Persian Connect.
            </AlertDescription>
          </Alert>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-3">Review Process:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">1. Payment</Badge>
            <Badge variant="outline">2. AI Review</Badge>
            <Badge variant="outline">3. Auto-Approval or Manual Review</Badge>
            <Badge variant="outline">4. Live for 30 Days</Badge>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Content Guidelines:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• No inappropriate language or adult content</li>
            <li>• No fraudulent or scam-related content</li>
            <li>• No violence, weapons, or illegal items</li>
            <li>• Images must be appropriate and relevant</li>
            <li>• Pricing must be realistic for the category</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}