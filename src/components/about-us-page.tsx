import { useLanguage } from './hooks/useLanguage';
import { ArrowLeft, Users, Target, Globe, CheckCircle, Zap, Shield, Heart } from 'lucide-react';

interface AboutUsPageProps {
  onNavigate: (page: any) => void;
}

export function AboutUsPage({ onNavigate }: AboutUsPageProps) {
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
            <h1 className="font-semibold text-foreground">About Us</h1>
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
            <Users className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">About Us</h1>
            <p className="text-muted-foreground text-lg">
              Welcome to Persian Connect, your trusted online hub for services, jobs, fashion, real estate, and community connections.
            </p>
          </div>

          {/* Mission Statement */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We created Persian Connect with one goal in mind: to make life easier by connecting people and businesses in one simple platform. Whether you're searching for a reliable electrician, a new job opportunity, a stylish outfit, or even your next home, Persian Connect brings it all together in one place.
            </p>
          </section>

          {/* What We Offer */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              🌍 What We Offer
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Services Directories
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Find trusted professionals for home, business, beauty, IT, and more.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Recruitments & Jobs
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Explore career opportunities or hire the right talent quickly.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Fashion & Lifestyle
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Shop clothing, accessories, and beauty with modern and traditional flair.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Real Estate
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Browse homes, rentals, and commercial properties with ease.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Community Ads
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Buy, sell, and promote within your local and global Persian community.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              ✅ Why Choose Us?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Wide Range of Categories</h3>
                    <p className="text-muted-foreground text-sm">
                      From daily services to business solutions, we've got it all.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">User-Friendly</h3>
                    <p className="text-muted-foreground text-sm">
                      Simple search and posting tools to save you time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Safe & Transparent</h3>
                    <p className="text-muted-foreground text-sm">
                      We connect people, but leave transactions and choices in your hands.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Global Reach</h3>
                    <p className="text-muted-foreground text-sm">
                      Serving users across UK, EU, USA, UAE, Turkey, and worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              Our Values
            </h2>
            <div className="text-center">
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                At Persian Connect, we believe in community, trust, and opportunity. Our platform empowers individuals and businesses to connect, grow, and succeed together.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Community</h3>
                  <p className="text-muted-foreground text-sm">Building connections that matter</p>
                </div>
                
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Trust</h3>
                  <p className="text-muted-foreground text-sm">Safe and reliable platform</p>
                </div>
                
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground">Opportunity</h3>
                  <p className="text-muted-foreground text-sm">Creating chances for success</p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Join Our Community Today</h2>
            <p className="text-muted-foreground mb-6">
              Ready to connect with thousands of users and businesses? Start your journey with Persian Connect today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('login')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Get Started
              </button>
              <button 
                onClick={() => onNavigate('post-ad')}
                className="bg-action text-action-foreground px-6 py-3 rounded-lg hover:bg-action/90 transition-colors font-medium"
              >
                Post Your First Ad
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}