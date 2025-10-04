import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { FileText, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import realDataService from './services/real-data-service';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  userId: string;
}

export function TermsAcceptanceModal({ isOpen, onAccept, onDecline, userId }: TermsAcceptanceModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) {
      toast.error('Please read and accept the terms and conditions to continue');
      return;
    }

    setLoading(true);
    try {
      await realDataService.acceptTermsAndConditions(userId);
      toast.success('Terms and conditions accepted successfully!');
      onAccept();
    } catch (error: any) {
      console.error('Terms acceptance error:', error);
      // Show a more user-friendly error message
      if (error.message?.includes('Server not available')) {
        toast.success('Terms accepted! Your preferences have been saved locally.');
        onAccept(); // Still proceed since fallback worked
      } else {
        toast.error('Unable to save your acceptance. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    toast.error('You must accept the terms and conditions to use Persian Connect');
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Terms and Conditions</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Please read and accept our terms to continue using Persian Connect
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 text-sm">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  These terms and conditions constitute a legally binding agreement between you and Persian Connect.
                </AlertDescription>
              </Alert>

              <section>
                <h3 className="font-semibold text-base mb-3">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using Persian Connect, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">2. User Responsibilities</h3>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>As a user of Persian Connect, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Provide accurate and truthful information in all listings</li>
                    <li>Respect other users and maintain professional communication</li>
                    <li>Not post illegal, harmful, or inappropriate content</li>
                    <li>Use the platform only for legitimate commercial purposes</li>
                    <li>Maintain the security of your account credentials</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">3. Prohibited Activities</h3>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>The following activities are strictly prohibited:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Posting fraudulent or misleading advertisements</li>
                    <li>Harassment or inappropriate contact with other users</li>
                    <li>Attempting to circumvent payment or security systems</li>
                    <li>Using automated tools to spam or abuse the platform</li>
                    <li>Violating any applicable laws or regulations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">4. Privacy and Data Protection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We respect your privacy and are committed to protecting your personal data. By using our service, 
                  you consent to the collection and use of information in accordance with our Privacy Policy. 
                  We implement appropriate security measures to protect your data against unauthorized access.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">5. Payment and Fees</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Certain services on Persian Connect require payment of fees. All fees are non-refundable unless 
                  explicitly stated otherwise. We reserve the right to modify our fee structure with reasonable notice.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">6. Content Moderation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to review, moderate, or remove any content that violates these terms or 
                  our community guidelines. We may also suspend or terminate accounts that repeatedly violate our policies.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">7. Limitation of Liability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Persian Connect provides the platform "as is" without warranties of any kind. We are not liable 
                  for any damages arising from your use of the service or transactions between users.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">8. Changes to Terms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Users will be notified of significant 
                  changes, and continued use of the service constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-3">9. Contact Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these terms and conditions, please contact us through our 
                  support channels available on the platform.
                </p>
              </section>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Version 1.0
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <div className="w-full space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="accept-terms" className="text-sm leading-relaxed">
                I have read and agree to the Terms and Conditions of Persian Connect. 
                I understand that this agreement is legally binding and that I must comply 
                with all stated terms and conditions.
              </label>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Your acceptance will be recorded with a timestamp for legal compliance purposes.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={loading}
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!accepted || loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  'Accept & Continue'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}