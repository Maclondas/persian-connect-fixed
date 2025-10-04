import { getDomainConfig, seoConfig } from '../config/domain';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DomainBrandingProps {
  variant?: 'header' | 'footer' | 'email' | 'social';
  showDomain?: boolean;
  className?: string;
  onNavigate?: (page: any) => void;
}

export function DomainBranding({ variant = 'header', showDomain = false, className = '', onNavigate }: DomainBrandingProps) {
  const domainConfig = getDomainConfig();
  
  const renderContent = () => {
    switch (variant) {
      case 'header':
        return (
          <div className={`flex items-center space-x-2 ${className}`}>
            <div 
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => onNavigate?.('support-info')}
            >
              <div className="flex flex-col space-y-1">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
              </div>
            </div>
          </div>
        );
        
      case 'footer':
        return (
          <div className={`text-center ${className}`}>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 border border-gray-200 shadow-sm">
              <ImageWithFallback 
                src="figma:asset/38452b78a6515849ab0586ef8be9163db27d1bfa.png" 
                alt="Persian Connect" 
                className="w-10 h-10 object-contain" 
              />
            </div>
          </div>
        );
        
      case 'email':
        return (
          <div className={`text-center ${className}`}>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 border border-gray-200 shadow-sm">
              <ImageWithFallback 
                src="figma:asset/38452b78a6515849ab0586ef8be9163db27d1bfa.png" 
                alt="Persian Connect" 
                className="w-10 h-10 object-contain" 
              />
            </div>
          </div>
        );
        
      case 'social':
        return (
          <div className={`${className}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                <ImageWithFallback 
                  src="figma:asset/38452b78a6515849ab0586ef8be9163db27d1bfa.png" 
                  alt="Persian Connect" 
                  className="w-8 h-8 object-contain" 
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return renderContent();
}

// Contact Information Component
export function ContactInfo({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Contact information removed */}
    </div>
  );
}

// Social Links Component
export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-4 ${className}`}>
      {/* Social links removed */}
    </div>
  );
}