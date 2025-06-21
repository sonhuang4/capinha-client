import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Switch } from '@/components/ui/switch';
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
  ExternalLink,
  Moon,
  Sun,
  Sparkles,
  Star,
  ArrowDown,
  Calendar,
  Briefcase
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
    primary: 'from-blue-600 to-blue-700',
    secondary: 'from-blue-50 to-blue-100',
    accent: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    glass: 'bg-blue-500/10 border-blue-200',
    darkGlass: 'bg-blue-400/5 border-blue-400/20'
  },
  purple: {
    primary: 'from-purple-600 to-purple-700',
    secondary: 'from-purple-50 to-purple-100',
    accent: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700',
    glass: 'bg-purple-500/10 border-purple-200',
    darkGlass: 'bg-purple-400/5 border-purple-400/20'
  },
  green: {
    primary: 'from-emerald-600 to-green-700',
    secondary: 'from-emerald-50 to-green-100',
    accent: 'text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    glass: 'bg-emerald-500/10 border-emerald-200',
    darkGlass: 'bg-emerald-400/5 border-emerald-400/20'
  },
  pink: {
    primary: 'from-pink-600 to-rose-700',
    secondary: 'from-pink-50 to-rose-100',
    accent: 'text-pink-600',
    button: 'bg-pink-600 hover:bg-pink-700',
    glass: 'bg-pink-500/10 border-pink-200',
    darkGlass: 'bg-pink-400/5 border-pink-400/20'
  },
  orange: {
    primary: 'from-orange-600 to-amber-700',
    secondary: 'from-orange-50 to-amber-100',
    accent: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-700',
    glass: 'bg-orange-500/10 border-orange-200',
    darkGlass: 'bg-orange-400/5 border-orange-400/20'
  },
  dark: {
    primary: 'from-slate-800 to-gray-900',
    secondary: 'from-slate-50 to-gray-100',
    accent: 'text-slate-700',
    button: 'bg-slate-700 hover:bg-slate-800',
    glass: 'bg-slate-500/10 border-slate-200',
    darkGlass: 'bg-slate-400/5 border-slate-400/20'
  }
};

const PublicCardView: React.FC = () => {
  const { props } = usePage<PublicCardViewProps>();
  const { card, code } = props;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const theme = themeConfig[card?.color_theme as keyof typeof themeConfig] || themeConfig.blue;

  // Scroll effect for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--dark-bg', '#020818');
      document.documentElement.style.setProperty('--dark-text', '#ae9efd');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
        darkMode ? 'dark' : ''
      }`} style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#f8fafc', color: '#1e293b' }}>
        <div className="text-center px-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-transparent border-t-blue-600 mx-auto"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 sm:h-20 sm:w-20 border border-blue-600/30 mx-auto"></div>
          </div>
          <p className={`mt-6 text-sm sm:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando cartão digital...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title={`${card.name} | Cartão Digital`} />
      
      <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark' : ''}`}
           style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#f8fafc', color: '#1e293b' }}>
        
        {/* Floating Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <div className={`flex items-center space-x-3 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-900/50 border-gray-700/50' 
              : 'bg-white/80 border-white/50'
          }`}>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-purple-600"
            />
            {darkMode ? (
              <Moon className="w-4 h-4 text-purple-400" />
            ) : (
              <Sun className="w-4 h-4 text-orange-500" />
            )}
          </div>
        </div>

        {/* Hero Section with Advanced Design */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
            }}></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 text-center px-6 py-20">
            {/* Profile Section */}
            <div className="mb-8 relative">
              {/* Profile Picture with Advanced Styling */}
              <div className="relative inline-block">
                {card.profile_picture ? (
                  <div className="relative">
                    <img
                      src={card.profile_picture}
                      alt={card.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full mx-auto object-cover shadow-2xl ring-4 ring-white/20 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full mx-auto bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                    <User className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white/60" />
                  </div>
                )}
                
                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/20">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Company Logo Floating */}
              {card.logo && (
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
                    <img
                      src={card.logo}
                      alt="Company logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Name and Title with Typography Hierarchy */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {card.name}
              </h1>
              
              {card.job_title && (
                <div className="flex items-center justify-center gap-3">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-light">
                    {card.job_title}
                  </p>
                </div>
              )}
              
              {card.company && (
                <div className="flex items-center justify-center gap-3">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
                  <p className="text-lg sm:text-xl text-white/80 font-medium">
                    {card.company}
                  </p>
                </div>
              )}
              
              {card.location && (
                <div className="flex items-center justify-center gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                  <p className="text-base sm:text-lg text-white/70">
                    {card.location}
                  </p>
                </div>
              )}
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ArrowDown className="w-6 h-6 text-white/60" />
            </div>
          </div>
        </div>

        {/* Main Content with Glass Morphism Cards */}
        <div className="relative z-10 -mt-20">
          <div className="container mx-auto px-6 pb-20 max-w-6xl">
            
            {/* Bio Section */}
            {card.bio && (
              <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border transition-all duration-300 hover:shadow-3xl ${
                darkMode 
                  ? `${theme.darkGlass} bg-gray-900/30` 
                  : `${theme.glass} bg-white/70`
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${theme.button} flex items-center justify-center shadow-lg`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Sobre
                  </h2>
                </div>
                <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {card.bio}
                </p>
              </div>
            )}

            {/* Contact Actions with Modern Design */}
            <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border transition-all duration-300 hover:shadow-3xl ${
              darkMode 
                ? `${theme.darkGlass} bg-gray-900/30` 
                : `${theme.glass} bg-white/70`
            }`}>
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 rounded-2xl ${theme.button} flex items-center justify-center shadow-lg`}>
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Entre em Contato
                </h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {card.phone && (
                  <button
                    onClick={handlePhoneCall}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center gap-3">
                      <Phone className="w-8 h-8" />
                      <span className="font-semibold">Ligar</span>
                    </div>
                  </button>
                )}

                {card.whatsapp && (
                  <button
                    onClick={handleWhatsApp}
                    className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center gap-3">
                      <MessageCircle className="w-8 h-8" />
                      <span className="font-semibold">WhatsApp</span>
                    </div>
                  </button>
                )}

                {card.email && (
                  <button
                    onClick={handleEmail}
                    className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center gap-3">
                      <Mail className="w-8 h-8" />
                      <span className="font-semibold">Email</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={saveContact}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center gap-3">
                    <Download className="w-8 h-8" />
                    <span className="font-semibold">Salvar</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Media with Enhanced Design */}
            {(card.website || card.instagram || card.linkedin || card.twitter || card.facebook) && (
              <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border transition-all duration-300 hover:shadow-3xl ${
                darkMode 
                  ? `${theme.darkGlass} bg-gray-900/30` 
                  : `${theme.glass} bg-white/70`
              }`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-12 h-12 rounded-2xl ${theme.button} flex items-center justify-center shadow-lg`}>
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Redes Sociais
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {card.website && (
                    <button
                      onClick={handleWebsite}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <Globe className="w-8 h-8" />
                        <span className="font-semibold text-sm">Website</span>
                      </div>
                    </button>
                  )}

                  {card.instagram && (
                    <button
                      onClick={() => handleSocialMedia('instagram', card.instagram)}
                      className="group relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <Instagram className="w-8 h-8" />
                        <span className="font-semibold text-sm">Instagram</span>
                      </div>
                    </button>
                  )}

                  {card.linkedin && (
                    <button
                      onClick={() => handleSocialMedia('linkedin', card.linkedin)}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <Linkedin className="w-8 h-8" />
                        <span className="font-semibold text-sm">LinkedIn</span>
                      </div>
                    </button>
                  )}

                  {card.twitter && (
                    <button
                      onClick={() => handleSocialMedia('twitter', card.twitter)}
                      className="group relative overflow-hidden bg-gradient-to-r from-sky-600 to-sky-700 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-700 to-sky-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <Twitter className="w-8 h-8" />
                        <span className="font-semibold text-sm">Twitter</span>
                      </div>
                    </button>
                  )}

                  {card.facebook && (
                    <button
                      onClick={() => handleSocialMedia('facebook', card.facebook)}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <Facebook className="w-8 h-8" />
                        <span className="font-semibold text-sm">Facebook</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Share Actions with Advanced Design */}
            <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 border transition-all duration-300 hover:shadow-3xl ${
              darkMode 
                ? `${theme.darkGlass} bg-gray-900/30` 
                : `${theme.glass} bg-white/70`
            }`}>
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 rounded-2xl ${theme.button} flex items-center justify-center shadow-lg`}>
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Compartilhar Cartão
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleShare}
                  className={`group relative overflow-hidden ${theme.button} text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 flex-1`}
                >
                  <Share2 className="w-6 h-6" />
                  <span className="font-semibold text-lg">Compartilhar</span>
                  <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3 flex-1"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span className="font-semibold text-lg">
                    {copied ? 'Copiado!' : 'Copiar Link'}
                  </span>
                  {copied && <Star className="w-5 h-5 text-yellow-400 animate-pulse" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className={`relative border-t backdrop-blur-xl ${
          darkMode 
            ? 'bg-gray-900/50 border-gray-700/50' 
            : 'bg-white/50 border-gray-200/50'
        }`}>
          <div className="container mx-auto px-6 py-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className={`w-5 h-5 ${theme.accent}`} />
              <span className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Powered by
              </span>
              <a 
                href="/" 
                className={`text-xl font-bold ${theme.accent} hover:underline transition-colors`}
              >
                DigitalCard
              </a>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Criando conexões digitais profissionais
            </p>
          </div>
        </footer>

        {/* Enhanced Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className={`rounded-3xl max-w-md w-full p-8 shadow-2xl border animate-in slide-in-from-bottom-4 duration-300 ${
              darkMode 
                ? 'bg-gray-900/90 border-gray-700/50 backdrop-blur-xl' 
                : 'bg-white/90 border-gray-200/50 backdrop-blur-xl'
            }`}>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full ${theme.button} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Compartilhar Cartão
                </h3>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={copyToClipboard}
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-300 hover:scale-105 active:scale-95 ${
                    darkMode 
                      ? 'bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-700/50' 
                      : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-900 border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{copied ? 'Link copiado!' : 'Copiar link'}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Compartilhe o link diretamente
                      </p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    const whatsappText = `Confira meu cartão digital: ${window.location.href}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`, '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-4 rounded-2xl text-left transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Compartilhar via WhatsApp</p>
                      <p className="text-sm text-green-100">
                        Envie para seus contatos
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                className={`w-full mt-6 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 font-semibold ${
                  darkMode 
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 text-white' 
                    : 'bg-gray-200/50 hover:bg-gray-300/50 text-gray-900'
                }`}
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