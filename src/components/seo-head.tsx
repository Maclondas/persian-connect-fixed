import { useEffect } from 'react';
import { generateMetaTags } from '../config/domain';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  article?: boolean;
}

export function SEOHead({ title, description, path, image, article = false }: SEOHeadProps) {
  useEffect(() => {
    const meta = generateMetaTags(title, description, path);
    
    // Set document title
    document.title = meta.title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    // Update link tags
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      
      element.setAttribute('href', href);
    };
    
    // Basic meta tags
    updateMetaTag('description', meta.description);
    updateMetaTag('keywords', meta.keywords);
    updateMetaTag('author', 'Persian Connect');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('language', 'English, Persian');
    
    // Open Graph tags
    updateMetaTag('og:title', meta.ogTitle, true);
    updateMetaTag('og:description', meta.ogDescription, true);
    updateMetaTag('og:url', meta.ogUrl, true);
    updateMetaTag('og:type', article ? 'article' : 'website', true);
    updateMetaTag('og:image', image || meta.ogImage, true);
    updateMetaTag('og:site_name', 'Persian Connect', true);
    updateMetaTag('og:locale', 'en_US', true);
    updateMetaTag('og:locale:alternate', 'fa_IR', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', meta.twitterTitle);
    updateMetaTag('twitter:description', meta.twitterDescription);
    updateMetaTag('twitter:image', image || meta.twitterImage);
    updateMetaTag('twitter:site', '@persianconnect');
    updateMetaTag('twitter:creator', '@persianconnect');
    
    // Canonical URL
    updateLinkTag('canonical', meta.canonical);
    
    // Alternate language links
    updateLinkTag('alternate', `${meta.canonical}?lang=fa`);
    
    // Additional SEO tags
    updateMetaTag('theme-color', '#0ac2af');
    updateMetaTag('msapplication-TileColor', '#0ac2af');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    updateMetaTag('apple-mobile-web-app-title', 'Persian Connect');
    
  }, [title, description, path, image, article]);
  
  return null; // This component doesn't render anything
}