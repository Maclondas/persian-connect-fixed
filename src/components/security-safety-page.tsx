import { useLanguage } from './hooks/useLanguage';
import { Shield, Lock, Eye, AlertTriangle, MessageCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface SecuritySafetyPageProps {
  onNavigate: (page: any) => void;
}

export function SecuritySafetyPage({ onNavigate }: SecuritySafetyPageProps) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          {/* Back button */}
          <div 
            className="relative shrink-0 size-[48px] cursor-pointer hover:bg-muted rounded-lg transition-colors flex items-center justify-center" 
            onClick={() => onNavigate('support-info')}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </div>
          
          {/* Title */}
          <div className="flex-1 text-center">
            <h1 className="font-semibold text-foreground">Security & Safety</h1>
          </div>
          
          {/* Spacer for centering */}
          <div className="w-12"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          
          {/* Hero Section */}
          <div className="text-center bg-primary/5 border border-primary/20 rounded-lg p-6">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Security at Persian Connect</h1>
            <p className="text-muted-foreground text-lg">
              At Persian Connect, your safety and trust are our top priority. We are committed to protecting your personal information, 
              preventing fraud, and ensuring a secure experience on our platform.
            </p>
          </div>

          {/* How We Keep You Secure */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              How We Keep You Secure
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Data Protection</h3>
                  <p className="text-muted-foreground text-sm">
                    All personal data is handled in compliance with GDPR (EU), CCPA (USA), KVKK (Turkey), and UAE Data Protection Law.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Secure Browsing</h3>
                  <p className="text-muted-foreground text-sm">
                    Our site uses SSL encryption (HTTPS) to protect your data during login, registration, and transactions.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Account Protection</h3>
                  <p className="text-muted-foreground text-sm">
                    Strong password requirements and email verification help keep your account safe.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Fraud Monitoring</h3>
                  <p className="text-muted-foreground text-sm">
                    We actively monitor listings and user activity to detect and remove fraudulent or harmful content.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">User Reporting Tools</h3>
                  <p className="text-muted-foreground text-sm">
                    If you see a suspicious ad, fake job, or scam, you can easily report it to our team for review.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Responsibilities */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Your Responsibilities
            </h2>
            <p className="text-muted-foreground mb-4">
              While we provide a safe platform, security also depends on users. Please:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground text-sm">
                  Never share personal financial details (bank info, credit card) directly with unknown users.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground text-sm">
                  Verify products, services, and jobs before making payments or commitments.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground text-sm">
                  Use safe payment methods — avoid paying in cash unless meeting in person and fully satisfied.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground text-sm">
                  Report suspicious listings, users, or messages immediately.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Disclaimer
            </h2>
            <p className="text-muted-foreground">
              Persian Connect is a platform only. We do not guarantee or verify every product, service, or job listed. 
              It is the client's responsibility to check and confirm the legitimacy of any transaction before proceeding. 
              We are not responsible for losses, fraud, or disputes between users.
            </p>
          </section>

          {/* Security Support */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              Security Support
            </h2>
            <p className="text-muted-foreground mb-4">
              If you encounter suspicious activity or believe your account has been compromised, please contact us immediately at:
            </p>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <a 
                  href="mailto:helppersianconnect@gmail.com" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  helppersianconnect@gmail.com
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}