// Domain Configuration for Persian Connect
export const domainConfig = {
  // Production domain - Your Squarespace domain
  production: {
    domain: 'persian-connect.com',
    url: 'https://www.persian-connect.com',
    api: 'https://api.persian-connect.com',
    cdn: 'https://cdn.persian-connect.com'
  },
  
  // Staging domain
  staging: {
    domain: 'staging.persian-connect.com',
    url: 'https://staging.persian-connect.com',
    api: 'https://api-staging.persian-connect.com',
    cdn: 'https://cdn-staging.persian-connect.com'
  },
  
  // Development domain
  development: {
    domain: 'localhost:3000',
    url: 'http://localhost:3000',
    api: 'http://localhost:3001',
    cdn: 'http://localhost:3000'
  }
};

// Get current environment
export const getCurrentEnvironment = (): 'production' | 'staging' | 'development' => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  if (hostname === 'persian-connect.com' || hostname === 'www.persian-connect.com') {
    return 'production';
  } else if (hostname.includes('staging')) {
    return 'staging';
  } else {
    return 'development';
  }
};

// Get current domain configuration
export const getDomainConfig = () => {
  const env = getCurrentEnvironment();
  return domainConfig[env];
};

// SEO and Meta Configuration
export const seoConfig = {
  title: 'Classifieds Marketplace',
  description: 'A modern bilingual (English & Persian) classifieds marketplace connecting communities. Buy, sell, and discover services in your area.',
  keywords: [
    'persian classifieds',
    'bilingual marketplace',
    'persian community',
    'buy sell iran',
    'persian services',
    'classifieds ads',
    'iranian marketplace'
  ],
  author: 'Marketplace',
  language: 'en-US',
  locale: 'en_US',
  alternateLanguages: [
    { lang: 'fa', url: '?lang=fa' },
    { lang: 'en', url: '?lang=en' }
  ],
  social: {
    twitter: '',
    facebook: '',
    instagram: ''
  },
  contact: {
    email: '',
    phone: ''
  }
};

// Generate canonical URL
export const getCanonicalUrl = (path: string = '') => {
  const config = getDomainConfig();
  return `${config.url}${path}`;
};

// Generate meta tags
export const generateMetaTags = (pageTitle?: string, pageDescription?: string, pagePath?: string) => {
  const config = getDomainConfig();
  const title = pageTitle ? `${pageTitle} - Marketplace` : seoConfig.title;
  const description = pageDescription || seoConfig.description;
  const url = getCanonicalUrl(pagePath);
  
  return {
    title,
    description,
    keywords: seoConfig.keywords.join(', '),
    canonical: url,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogImage: `${config.cdn}/images/og-image.jpg`,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${config.cdn}/images/twitter-card.jpg`
  };
};