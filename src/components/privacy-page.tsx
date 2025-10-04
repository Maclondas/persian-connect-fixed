import { useLanguage } from './hooks/useLanguage';
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, FileText, Mail, CheckCircle, Users, Globe } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (page: any) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
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
            <h1 className="font-semibold text-foreground">Privacy & Security</h1>
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
              At Persian Connect, your safety and trust are our top priority. We are committed to protecting your personal information, preventing fraud, and ensuring a secure experience on our platform.
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
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Data Protection
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    All personal data is handled in compliance with GDPR (EU), CCPA (USA), KVKK (Turkey), and UAE Data Protection Law.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Secure Browsing
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Our site uses SSL encryption (HTTPS) to protect your data during login, registration, and transactions.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Account Protection
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Strong password requirements and email verification help keep your account safe.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Fraud Monitoring
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    We actively monitor listings and user activity to detect and remove fraudulent or harmful content.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    User Reporting Tools
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    If you see a suspicious ad, fake job, or scam, you can easily report it to our team for review.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Responsibilities */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Your Responsibilities
            </h2>
            
            <p className="text-muted-foreground mb-6">
              While we provide a safe platform, security also depends on users. Please:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-muted-foreground">
                  Never share personal financial details (bank info, credit card) directly with unknown users.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-muted-foreground">
                  Verify products, services, and jobs before making payments or commitments.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-muted-foreground">
                  Use safe payment methods — avoid paying in cash unless meeting in person and fully satisfied.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-muted-foreground">
                  Report suspicious listings, users, or messages immediately.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Disclaimer
            </h2>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-muted-foreground leading-relaxed">
                Persian Connect is a platform only. We do not guarantee or verify every product, service, or job listed. It is the client's responsibility to check and confirm the legitimacy of any transaction before proceeding. We are not responsible for losses, fraud, or disputes between users.
              </p>
            </div>
          </section>

          {/* Security Support */}
          <section className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Security Support
            </h2>
            <p className="text-muted-foreground mb-6">
              If you encounter suspicious activity or believe your account has been compromised, please contact us immediately at:
            </p>
            
            <div className="bg-background/50 border border-border rounded-lg p-4 text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <a 
                href="mailto:helppersianconnect@gmail.com" 
                className="text-primary hover:text-primary/80 transition-colors font-medium text-lg"
              >
                helppersianconnect@gmail.com
              </a>
              <p className="text-muted-foreground text-sm mt-2">
                We respond to security concerns within 24 hours
              </p>
            </div>
          </section>

          {/* Compliance Information */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Global Compliance
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">GDPR (EU)</h3>
                <p className="text-muted-foreground text-sm">General Data Protection Regulation compliance for European users</p>
              </div>
              
              <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">CCPA (USA)</h3>
                <p className="text-muted-foreground text-sm">California Consumer Privacy Act compliance for US users</p>
              </div>
              
              <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">KVKK (Turkey)</h3>
                <p className="text-muted-foreground text-sm">Personal Data Protection Law compliance for Turkish users</p>
              </div>
              
              <div className="text-center p-4 bg-background/50 rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-2">UAE Data Protection</h3>
                <p className="text-muted-foreground text-sm">UAE Data Protection Law compliance for UAE users</p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Stay Safe with Persian Connect</h2>
            <p className="text-muted-foreground mb-6">
              Your security is our priority. Together, we can maintain a safe and trustworthy marketplace for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('user-guide')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Read User Guide
              </button>
              <button 
                onClick={() => onNavigate('terms-conditions')}
                className="bg-card border border-border text-foreground px-6 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Terms & Conditions
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}