import { useLanguage } from './hooks/useLanguage';
import { BookOpen, Search, Plus, Settings, Shield, MessageCircle, Heart, UserCheck, Home, Filter, Star, ArrowLeft } from 'lucide-react';

interface UserGuidePageProps {
  onNavigate: (page: any) => void;
}

export function UserGuidePage({ onNavigate }: UserGuidePageProps) {
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
            <h1 className="font-semibold text-foreground">User Guide</h1>
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
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">User Guide</h1>
            <p className="text-muted-foreground text-lg">
              Welcome to Persian-Connect, your all-in-one platform for services, jobs, fashion, real estate, and more.
            </p>
          </div>

          {/* 1. Getting Started */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-primary" />
              1. Getting Started
            </h2>
            <p className="text-muted-foreground mb-4">
              To begin, visit www.persian-connect.com and follow these steps:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</div>
                <p className="text-muted-foreground text-sm">
                  Register for a free account using your email or social login.
                </p>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</div>
                <p className="text-muted-foreground text-sm">
                  Complete your profile with your name, a profile picture or logo, your location, and contact details.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Browsing Categories */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              2. Browsing Categories
            </h2>
            <p className="text-muted-foreground mb-4">
              You can explore Persian-Connect through our main sections:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Services</h3>
                  <p className="text-muted-foreground text-sm">
                    Find electricians, plumbers, builders, cleaners, beauty clinics, IT specialists, tutors, and more.
                  </p>
                </div>
                
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Recruitments & Jobs</h3>
                  <p className="text-muted-foreground text-sm">
                    Browse full-time, part-time, freelance, and remote opportunities across industries.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Fashion</h3>
                  <p className="text-muted-foreground text-sm">
                    Shop for clothing, accessories, beauty products, and traditional Persian-inspired fashion.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Real Estate</h3>
                  <p className="text-muted-foreground text-sm">
                    Search for properties for rent, sale, or commercial use.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Business Directory</h3>
                  <p className="text-muted-foreground text-sm">
                    Connect with local businesses and professionals.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Community Ads</h3>
                  <p className="text-muted-foreground text-sm">
                    Buy, sell, or advertise various products and services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Finding What You Need */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              3. Finding What You Need
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Search Bar</p>
                  <p className="text-muted-foreground text-sm">
                    Use the search bar at the top of the page to find specific services, products, or jobs.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Filter className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Filters</p>
                  <p className="text-muted-foreground text-sm">
                    Apply filters for location, price, category, or keywords to narrow down your results.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Subcategories</p>
                  <p className="text-muted-foreground text-sm">
                    Browse subcategories for more specific results (e.g., under Services, you can select Plumbing, Cleaning, IT & Web Services, etc.).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Posting an Ad or Service */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6 text-primary" />
              4. Posting an Ad or Service
            </h2>
            <p className="text-muted-foreground mb-4">
              To share your own listing, follow these simple steps:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</div>
                <p className="text-muted-foreground text-sm">Log in to your account.</p>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</div>
                <p className="text-muted-foreground text-sm">Click the "Post Ad" button.</p>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</div>
                <p className="text-muted-foreground text-sm">Choose the correct category (e.g., Service, Job, Fashion, Real Estate).</p>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">4</div>
                <p className="text-muted-foreground text-sm">Fill in the necessary details: title, description, price, location, and add high-quality images.</p>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">5</div>
                <p className="text-muted-foreground text-sm">Submit your ad for approval. It will go live shortly after a quick review.</p>
              </div>
            </div>
          </section>

          {/* 5. Managing Your Account */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              5. Managing Your Account
            </h2>
            <p className="text-muted-foreground mb-4">
              Your personal dashboard gives you full control over your activities:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  My Ads
                </h3>
                <p className="text-muted-foreground text-sm">
                  View, edit, or delete your active listings.
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Messages
                </h3>
                <p className="text-muted-foreground text-sm">
                  Communicate directly and securely with clients or sellers.
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorites
                </h3>
                <p className="text-muted-foreground text-sm">
                  Save ads or jobs you are interested in for later viewing.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Safety Tips */}
          <section className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-600" />
              6. Safety Tips
            </h2>
            <p className="text-muted-foreground mb-4">
              Your safety is our priority. Please keep these tips in mind:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  Always arrange to meet in safe, public locations when dealing with buyers or sellers in person.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  Verify job offers and employers before sharing sensitive personal information.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  When hiring for services, check reviews and ratings from other users if available.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  Use trusted and secure payment methods. Avoid large cash transactions if possible.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Support */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              7. Support
            </h2>
            <p className="text-muted-foreground mb-4">
              We are here to help you:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Help Center / FAQ</h3>
                <p className="text-muted-foreground text-sm">
                  Find answers to common questions.
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Contact Us</h3>
                <p className="text-muted-foreground text-sm">
                  Submit your queries through our contact form or email for support.
                </p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Feedback</h3>
                <p className="text-muted-foreground text-sm">
                  We welcome your ideas to improve Persian-Connect for everyone.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}