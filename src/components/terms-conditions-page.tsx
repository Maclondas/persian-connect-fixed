import { useLanguage } from './hooks/useLanguage';
import { ArrowLeft } from 'lucide-react';

interface TermsConditionsPageProps {
  onNavigate: (page: any) => void;
}

export function TermsConditionsPage({ onNavigate }: TermsConditionsPageProps) {
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
            <h1 className="font-semibold text-foreground">Terms & Conditions</h1>
          </div>
          
          {/* Spacer for centering */}
          <div className="w-12"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-gray max-w-none">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            
            <div className="mb-8">
              <p>
                Welcome to Persian-Connect.com. These Terms & Conditions ("Terms") govern your use of our website and services. 
                By accessing or using Persian-Connect.com, you agree to these Terms. If you do not agree, please discontinue use of the site.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">1. General Use of the Site</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Persian-Connect.com is an online platform where users can post and browse ads for services, jobs, fashion, real estate, products, and other listings.</li>
                <li>• We provide a listing and advertising service only. We are not a seller, buyer, employer, or recruiter in any transaction.</li>
                <li>• You must be at least 18 years old to register and use our services.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">2. User Responsibilities</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• You are responsible for the accuracy of all information you provide (ads, listings, messages, reviews, etc.).</li>
                <li>• You agree not to post illegal, misleading, fraudulent, or harmful content.</li>
                <li>• You are responsible for ensuring that your use of the site complies with local laws and regulations in your country (UK, EU, USA, UAE, Turkey, or elsewhere).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">3. Purchases, Sales & Services</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Persian Connect is not responsible for any items, products, or services purchased, sold, or exchanged through ads or listings on our site.</li>
                <li>• It is the client's sole responsibility to verify the quality, safety, legality, and authenticity of any product or service before buying, selling, or hiring.</li>
                <li>• All payments, contracts, and agreements are strictly between users. We are not a party to such transactions.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">4. Jobs & Recruitment Listings</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Job seekers and employers are responsible for verifying the legitimacy of job offers and applicants.</li>
                <li>• Persian Connect does not guarantee employment, wages, or hiring outcomes.</li>
                <li>• We are not liable for disputes arising between employers and job seekers.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">5. Real Estate & Property Listings</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• All property ads are provided by third parties.</li>
                <li>• Users must conduct their own due diligence (legal checks, ownership verification, inspections) before renting, buying, or selling.</li>
                <li>• Persian Connect does not verify property ownership or legal status.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">6. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-2">Users may not:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Post false, misleading, or fraudulent ads.</li>
                <li>• Promote illegal goods or services.</li>
                <li>• Infringe intellectual property rights.</li>
                <li>• Harass, scam, or exploit other users.</li>
                <li>• Attempt to hack, disrupt, or misuse the platform.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">7. Content Ownership</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Users retain ownership of the content they post but grant Persian Connect a non-exclusive license to display and distribute it on our platform.</li>
                <li>• We reserve the right to edit, reject, or remove any listing that violates our policies or legal requirements.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">8. Limitation of Liability</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Persian Connect is provided "as is" and "as available" without warranties.</li>
                <li>• We make no guarantees regarding the accuracy, availability, or reliability of listings.</li>
                <li>• To the fullest extent permitted by law (EU, USA, UAE, Turkey, and others), Persian Connect shall not be liable for:</li>
                <ul className="ml-4 space-y-1">
                  <li>• Losses, damages, or disputes arising from user transactions.</li>
                  <li>• Fraud, misrepresentation, or non-performance by users.</li>
                  <li>• Direct, indirect, or incidental damages related to the use of the platform.</li>
                </ul>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">9. Privacy & Data Protection</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We comply with GDPR (EU), CCPA (California, USA), UAE Data Protection Law, and Turkish KVKK Law.</li>
                <li>• Personal data is collected, stored, and processed according to our Privacy Policy.</li>
                <li>• Users have rights to access, correct, or delete their data.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">10. Termination of Account</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We may suspend or terminate accounts that violate these Terms.</li>
                <li>• Users may close their account at any time.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">11. Governing Law</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• These Terms are governed by the applicable laws of the EU, USA, UAE, and Turkey, depending on the user's jurisdiction.</li>
                <li>• Disputes shall be resolved under the competent courts of the relevant jurisdiction.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">12. Changes to Terms</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• We may update these Terms from time to time.</li>
                <li>• Continued use of Persian-Connect.com means you accept the updated Terms.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">13. Contact Us</h2>
              <p className="text-muted-foreground">For questions or legal matters, please contact:</p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-foreground">📧 helppersianconnect@gmail.com</p>
                <p className="text-foreground">📍 www.persian-connect.com</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}