import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Globe, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  MapPin,
  Building,
  User,
  Share2,
  Download,
  QrCode,
  Clock,
  Heart,
  ExternalLink
} from 'lucide-react';

interface Card {
  id: number;
  name: string;
  job_title?: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  location?: string;
  bio?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  profile_picture?: string;
  logo?: string;
  color_theme: string;
}

interface PublicCardViewProps {
  card: Card;
  code: string;
}

const themeConfig = {
  blue: {
    primary: 'bg-blue-600',
    secondary: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    gradient: 'from-blue-600 to-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700',
    accent: 'text-blue-500'
  },
  purple: {
    primary: 'bg-purple-600',
    secondary: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    gradient: 'from-purple-600 to-purple-800',
    button: 'bg-purple-600 hover:bg-purple-700',
    accent: 'text-purple-500'
  },
  green: {
    primary: 'bg-green-600',
    secondary: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    gradient: 'from-green-600 to-green-800',
    button: 'bg-green-600 hover:bg-green-700',
    accent: 'text-green-500'
  },
  pink: {
    primary: 'bg-pink-600',
    secondary: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    gradient: 'from-pink-600 to-pink-800',
    button: 'bg-pink-600 hover:bg-pink-700',
    accent: 'text-pink-500'
  },
  orange: {
    primary: 'bg-orange-600',
    secondary: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    gradient: 'from-orange-600 to-orange-800',
    button: 'bg-orange-600 hover:bg-orange-700',
    accent: 'text-orange-500'
  },
  dark: {
    primary: 'bg-gray-800',
    secondary: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    gradient: 'from-gray-800 to-gray-900',
    button: 'bg-gray-800 hover:bg-gray-900',
    accent: 'text-gray-600'
  }
};

const PublicCardView: React.FC = () => {
  const { props } = usePage<PublicCardViewProps>();
  const { card, code } = props;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = themeConfig[card?.color_theme as keyof typeof themeConfig] || themeConfig.blue;

  // Handle contact actions
  const handlePhoneCall = () => {
    if (card?.phone) {
      window.open(`tel:${card.phone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (card?.whatsapp) {
      const message = `Olá ${card.name}! Vi seu cartão digital e gostaria de entrar em contato.`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${card.whatsapp}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEmail = () => {
    if (card?.email) {
      const subject = `Contato via Cartão Digital - ${card.name}`;
      const body = `Olá ${card.name}!\n\nVi seu cartão digital e gostaria de entrar em contato.\n\nAtenciosamente,`;
      window.open(`mailto:${card.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (card?.website) {
      let url = card.website;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank');
    }
  };

  const handleSocialMedia = (platform: string, username?: string) => {
    if (!username) return;
    
    let url = '';
    switch (platform) {
      case 'instagram':
        url = username.startsWith('http') ? username : `https://instagram.com/${username.replace('@', '')}`;
        break;
      case 'linkedin':
        url = username.startsWith('http') ? username : `https://linkedin.com/in/${username}`;
        break;
      case 'twitter':
        url = username.startsWith('http') ? username : `https://twitter.com/${username.replace('@', '')}`;
        break;
      case 'facebook':
        url = username.startsWith('http') ? username : `https://facebook.com/${username}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${card?.name} - Cartão Digital`,
      text: `Confira o cartão digital de ${card?.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Save contact (vCard)
  const saveContact = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${card?.name || ''}
ORG:${card?.company || ''}
TITLE:${card?.job_title || ''}
TEL:${card?.phone || ''}
EMAIL:${card?.email || ''}
URL:${card?.website || ''}
NOTE:${card?.bio || ''}
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card?.name || 'contato'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cartão...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title={`${card.name} | Cartão Digital`} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header/Hero Section */}
        <div className={`bg-gradient-to-r ${theme.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 text-center py-12 px-6">
            {/* Profile Picture */}
            <div className="mb-6">
              {card.profile_picture ? (
                <img
                  src={card.profile_picture}
                  alt={card.name}
                  className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-xl bg-white flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Name and Title */}
            <h1 className="text-3xl font-bold text-white mb-2">{card.name}</h1>
            {card.job_title && (
              <p className="text-xl text-white/90 mb-1">{card.job_title}</p>
            )}
            {card.company && (
              <p className="text-lg text-white/80 flex items-center justify-center gap-2">
                <Building className="w-4 h-4" />
                {card.company}
              </p>
            )}
            {card.location && (
              <p className="text-white/80 flex items-center justify-center gap-2 mt-2">
                <MapPin className="w-4 h-4" />
                {card.location}
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Bio Section */}
          {card.bio && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Sobre</h2>
              <p className="text-gray-600 leading-relaxed">{card.bio}</p>
            </div>
          )}

          {/* Contact Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Entre em Contato</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {card.phone && (
                <button
                  onClick={handlePhoneCall}
                  className={`${theme.button} text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105`}
                >
                  <Phone className="w-6 h-6" />
                  <span className="text-sm font-medium">Ligar</span>
                </button>
              )}

              {card.whatsapp && (
                <button
                  onClick={handleWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
              )}

              {card.email && (
                <button
                  onClick={handleEmail}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-sm font-medium">Email</span>
                </button>
              )}

              <button
                onClick={saveContact}
                className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                <span className="text-sm font-medium">Salvar</span>
              </button>
            </div>
          </div>

          {/* Social Media & Website */}
          {(card.website || card.instagram || card.linkedin || card.twitter || card.facebook) && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Redes Sociais</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {card.website && (
                  <button
                    onClick={handleWebsite}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
                  >
                    <Globe className="w-6 h-6" />
                    <span className="text-sm font-medium">Website</span>
                  </button>
                )}

                {card.instagram && (
                  <button
                    onClick={() => handleSocialMedia('instagram', card.instagram)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
                  >
                    <Instagram className="w-6 h-6" />
                    <span className="text-sm font-medium">Instagram</span>
                  </button>
                )}

                {card.linkedin && (
                  <button
                    onClick={() => handleSocialMedia('linkedin', card.linkedin)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
                  >
                    <Linkedin className="w-6 h-6" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </button>
                )}

                {card.twitter && (
                  <button
                    onClick={() => handleSocialMedia('twitter', card.twitter)}
                    className="bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
                  >
                    <Twitter className="w-6 h-6" />
                    <span className="text-sm font-medium">Twitter</span>
                  </button>
                )}

                {card.facebook && (
                  <button
                    onClick={() => handleSocialMedia('facebook', card.facebook)}
                    className="bg-blue-800 hover:bg-blue-900 text-white p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 hover:transform hover:scale-105"
                  >
                    <Facebook className="w-6 h-6" />
                    <span className="text-sm font-medium">Facebook</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Company Logo */}
          {card.logo && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 text-center">
              <img
                src={card.logo}
                alt={`${card.company} logo`}
                className="max-h-24 mx-auto object-contain"
              />
            </div>
          )}

          {/* Share Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Compartilhar Cartão</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleShare}
                className={`${theme.button} text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:transform hover:scale-105`}
              >
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
              
              <button
                onClick={copyToClipboard}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:transform hover:scale-105"
              >
                <ExternalLink className="w-5 h-5" />
                {copied ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 px-6 text-gray-500">
          <p className="text-sm">
            Powered by{' '}
            <a href="/" className={`${theme.text} hover:underline font-medium`}>
              Capinha Digital
            </a>
          </p>
        </footer>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Compartilhar Cartão</h3>
              <div className="space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-gray-600" />
                    <span>{copied ? 'Link copiado!' : 'Copiar link'}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    const whatsappText = `Confira meu cartão digital: ${window.location.href}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`, '_blank');
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <span>Compartilhar via WhatsApp</span>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 p-3 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicCardView;