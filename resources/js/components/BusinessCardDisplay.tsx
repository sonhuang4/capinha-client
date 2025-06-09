import React from 'react';
import { ExternalLink, MessageCircle, Instagram, Globe } from 'lucide-react';
import { BusinessCard, colorThemes } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BusinessCardDisplayProps {
  card: BusinessCard;
  preview?: boolean;
}

const BusinessCardDisplay: React.FC<BusinessCardDisplayProps> = ({ card, preview = false }) => {
  // Add defensive checks for theme
  const defaultTheme = {
    primary: 'from-blue-500 to-purple-600',
    text: 'text-blue-600'
  };
  
  // Safely get theme with fallback
  const theme = (colorThemes && card.colorTheme && colorThemes[card.colorTheme]) 
    ? colorThemes[card.colorTheme] 
    : defaultTheme;

  // Add logging for debugging
  console.log('Card data:', card);
  console.log('Color theme key:', card.colorTheme);
  console.log('Available themes:', colorThemes);
  console.log('Selected theme:', theme);

  const handleLinkClick = (url: string, type: string) => {
    if (!preview) {
      console.log(`Clicked ${type}: ${url}`);
      window.open(url, '_blank');
    }
  };

  // Add validation for required fields
  if (!card || !card.name) {
    return (
      <Card className="material-card p-6 max-w-md mx-auto">
        <div className="text-center text-muted-foreground">
          Invalid card data - missing required information
        </div>
      </Card>
    );
  }

  return (
    <Card className={`material-card overflow-hidden max-w-md mx-auto ${preview ? 'scale-90' : ''}`}>
      <div className={`h-32 bg-gradient-to-r ${theme.primary} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        {card.logo && (
          <div className="absolute top-4 right-4">
            <img 
              src={card.logo} 
              alt="Logo" 
              className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm p-1"
              onError={(e) => {
                console.error('Logo failed to load:', card.logo);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="p-6 -mt-16 relative">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img 
              src={card.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&size=100&background=random`}
              alt={card.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              onError={(e) => {
                console.error('Profile picture failed to load:', card.profilePicture);
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&size=100&background=random`;
              }}
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-foreground">
            {card.name}
          </h1>

          <div className="space-y-3 w-full mt-6">
            {card.whatsapp && (
              <Button
                onClick={() => handleLinkClick(`https://wa.me/${card.whatsapp.replace(/[^\d]/g, '')}`, 'WhatsApp')}
                className={`w-full bg-gradient-to-r ${theme.primary} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                disabled={preview}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            )}

            {card.instagram && (
              <Button
                onClick={() => handleLinkClick(`https://instagram.com/${card.instagram}`, 'Instagram')}
                variant="outline"
                className={`w-full border-2 ${theme.text} hover:bg-gradient-to-r hover:${theme.primary} hover:text-white transition-all duration-300`}
                disabled={preview}
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            )}

            {card.website && (
              <Button
                onClick={() => handleLinkClick(card.website, 'Website')}
                variant="outline"
                className={`w-full border-2 ${theme.text} hover:bg-gradient-to-r hover:${theme.primary} hover:text-white transition-all duration-300`}
                disabled={preview}
              >
                <Globe className="w-4 h-4 mr-2" />
                Website
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BusinessCardDisplay;