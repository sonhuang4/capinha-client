import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  LogOut,
  Sun,
  Moon,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  QrCode,
  Eye,
  Download,
  Share2,
  MoreVertical,
  CreditCard,
  Settings,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  X,
  Menu,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

// TypeScript Interfaces
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  plan?: string;
}

interface Card {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  location?: string;
  job_title?: string;
  company?: string;
  profile_picture?: string;
  color_theme?: string;
  theme?: string;
  status: 'activated' | 'pending' | 'inactive';
  views?: number;
  click_count?: number;
  downloads?: number;
  created_at: string;
  createdAtFormatted?: string;
  cardUrl?: string;
  card_url?: string;
  code?: string;
  qrUrl?: string;
  isPremium?: boolean;
}

interface Stats {
  totalCards?: number;
  totalViews?: number;
  totalDownloads?: number;
  activeCards?: number;
}

interface Props {
  user?: User;
  userCards?: Card[];
  stats?: Stats;
}

interface ButtonProps {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: any;
}

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
  [key: string]: any;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
}

interface AlertState {
  message: string;
  type: 'default' | 'destructive' | 'success';
}

interface ConfirmModalState {
  isOpen: boolean;
  cardId: string | number | null;
  cardName: string;
}

// UI Components with TypeScript
const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false,
  children, 
  ...props 
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95";
  
  const variants = {
    default: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 dark:from-purple-700 dark:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600",
    outline: "border border-gray-300 dark:border-[#ae9efd]/30 bg-white dark:bg-[#020818] text-gray-700 dark:text-[#ae9efd] hover:bg-gray-50 dark:hover:bg-[#ae9efd]/10 focus:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600",
    ghost: "hover:bg-gray-100 dark:hover:bg-[#ae9efd]/10 text-gray-700 dark:text-[#ae9efd]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm h-8",
    default: "px-4 py-2 h-10",
    lg: "px-6 py-3 text-lg h-12"
  };
  
  return (
    <button
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Alert: React.FC<AlertProps> = ({ variant = 'default', className = '', children, onClose, ...props }) => {
  const variants = {
    default: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30 text-blue-800 dark:text-blue-300",
    destructive: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/30 text-red-800 dark:text-red-300",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/30 text-green-800 dark:text-green-300"
  };
  
  return (
    <div className={`p-4 rounded-md border ${variants[variant]} ${className} relative shadow-lg backdrop-blur-sm`} {...props}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
};

const AlertDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children, ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

// Confirmation Modal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Confirmar", 
  confirmVariant = "destructive" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#020818] rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-[#ae9efd]/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#ae9efd] mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-[#ae9efd]/70 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Navigation helper functions
const navigateToRoute = (path: string): void => {
  window.location.href = path;
};

const submitForm = async (url: string, data: any = {}, method: string = 'POST'): Promise<{ success: boolean; errors?: any; message?: string }> => {
  try {
    let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (!csrfToken) {
      const csrfResponse = await fetch('/csrf-token');
      const csrfData = await csrfResponse.json();
      csrfToken = csrfData.token;
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, errors: errorData.errors || {}, message: errorData.message };
    }
  } catch (error: any) {
    return { success: false, errors: { general: error.message } };
  }
};

const ClientDashboard: React.FC<Props> = ({ user, userCards, stats }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showCardMenu, setShowCardMenu] = useState<string | number | null>(null);
  const [cards, setCards] = useState<Card[]>(userCards || []);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, cardId: null, cardName: '' });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const showAlert = (message: string, type: AlertState['type'] = 'default', duration: number = 5000): void => {
    setAlert({ message, type });
    if (duration > 0) {
      setTimeout(() => setAlert(null), duration);
    }
  };

  const handleDeleteCard = async (cardId: string | number): Promise<void> => {
    if (isDeleting) return;

    setIsDeleting(true);
    setConfirmModal({ isOpen: false, cardId: null, cardName: '' });

    try {
      console.log('Deleting card ID:', cardId);
      
      const result = await submitForm(`/client/cards/${cardId}`, {}, 'DELETE');
      
      if (result.success) {
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
        showAlert('✅ Cartão excluído com sucesso!', 'success');
        console.log('Card deleted successfully');
      } else {
        console.error('Delete failed:', result);
        showAlert('❌ Erro ao excluir cartão. Tente novamente.', 'destructive');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showAlert('❌ Erro interno. Tente novamente.', 'destructive');
    } finally {
      setIsDeleting(false);
      setShowCardMenu(null);
    }
  };

  const confirmDelete = (card: Card): void => {
    setConfirmModal({
      isOpen: true,
      cardId: card.id,
      cardName: card.name
    });
    setShowCardMenu(null);
  };

  const handleEditCard = (card: Card): void => {
    console.log('Editing card:', card);
    const editUrl = `/client/cards/${card.id}/edit`;
    navigateToRoute(editUrl);
  };

  const handleViewCard = (card: Card): void => {
    const cardUrl = card.cardUrl || card.card_url || `/c/${card.code}`;
    window.open(cardUrl, '_blank');
  };

  const handleShareCard = async (card: Card): Promise<void> => {
    const cardUrl = card.cardUrl || card.card_url || `/c/${card.code}`;
    
    try {
      await navigator.clipboard.writeText(cardUrl);
      showAlert('✅ Link copiado para a área de transferência!', 'success');
    } catch (error) {
      showAlert(`📋 Link do cartão: ${cardUrl}`, 'default', 0);
    }
    setShowCardMenu(null);
  };

  const handleDownloadQR = (card: Card): void => {
    const qrUrl = card.qrUrl || `/cards/${card.id}/qr`;
    window.open(qrUrl, '_blank');
    setShowCardMenu(null);
  };

  const handleLogout = async (): Promise<void> => {
    router.post('/logout');
  };

  const handleGoBack = (): void => {
    navigateToRoute('/');
  };

  const handleCreateCard = (): void => {
    navigateToRoute('/purchase');
  };

  const toggleTheme = (): void => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const getThemeGradient = (theme?: string): string => {
    const themes: { [key: string]: string } = {
      'blue': 'from-blue-500 to-blue-600',
      'green': 'from-emerald-500 to-green-600',
      'purple': 'from-purple-500 to-violet-600',
      'pink': 'from-pink-500 to-rose-600',
      'orange': 'from-orange-500 to-amber-600',
      'dark': 'from-gray-800 to-slate-800',
      'gradient-blue': 'from-blue-500 to-blue-600',
      'gradient-green': 'from-emerald-500 to-green-600',
      'gradient-purple': 'from-purple-500 to-violet-600',
      'gradient-pink': 'from-pink-500 to-rose-600',
      'gradient-orange': 'from-orange-500 to-amber-600'
    };
    return themes[theme || 'blue'] || themes['blue'];
  };

  const formatWebsiteUrl = (website?: string): string => {
    if (!website) return '';
    if (website.startsWith('http')) return website;
    return website.replace(/^(https?:\/\/)/, '');
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowCardMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-[#020818] dark:via-[#0a0e1a] dark:to-[#1a0b2e] transition-all duration-300">

        {/* Alert */}
        {alert && (
          <div className="fixed top-4 right-4 z-50 max-w-xs sm:max-w-md">
            <Alert 
              variant={alert.type} 
              onClose={() => setAlert(null)}
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, cardId: null, cardName: '' })}
          onConfirm={() => confirmModal.cardId && handleDeleteCard(confirmModal.cardId)}
          title="Excluir Cartão"
          description={`Tem certeza que deseja excluir o cartão "${confirmModal.cardName}"? Esta ação não pode ser desfeita.`}
          confirmText={isDeleting ? "Excluindo..." : "Excluir"}
          confirmVariant="destructive"
        />

        {/* ULTRA-RESPONSIVE HEADER */}
        <header className="bg-white/80 dark:bg-[#020818]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#ae9efd]/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left: Back button and title */}
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 dark:text-[#ae9efd] hover:text-purple-600 dark:hover:text-[#ae9efd]/80 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#ae9efd]/10"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline text-sm sm:text-base">Voltar</span>
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-[#ae9efd] truncate">
                    Minha Conta
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-[#ae9efd]/70 hidden sm:block">
                    Gerencie seus cartões digitais
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-[#ae9efd]/10 hover:bg-gray-200 dark:hover:bg-[#ae9efd]/20 transition-colors"
                >
                  {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#ae9efd]" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">

          {/* RESPONSIVE USER INFO CARD */}
          <div className="bg-white/90 dark:bg-[#020818]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-[#ae9efd]/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#ae9efd] truncate">
                    {user?.name || 'Usuário'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-[#ae9efd]/70 truncate">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-[#ae9efd]/60">
                    {user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{user.phone}</span>
                      </span>
                    )}
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-xs font-medium">
                      Plano {user?.plan || 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-2 text-gray-400 dark:text-[#ae9efd]/60 hover:text-gray-600 dark:hover:text-[#ae9efd] transition-colors self-start sm:self-center">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ULTRA-RESPONSIVE STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white/90 dark:bg-[#020818]/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-[#ae9efd]/20 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#ae9efd]">
                    {stats?.totalCards || cards.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-[#ae9efd]/70">Cartões</div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-[#020818]/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-[#ae9efd]/20 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#ae9efd]">
                    {stats?.totalViews || cards.reduce((sum, card) => sum + (card.views || card.click_count || 0), 0)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-[#ae9efd]/70">
                    <span className="hidden sm:inline">Visualizações</span>
                    <span className="sm:hidden">Views</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-[#020818]/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-[#ae9efd]/20 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#ae9efd]">
                    {stats?.totalDownloads || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-[#ae9efd]/70">Downloads</div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-[#020818]/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-[#ae9efd]/20 hover:shadow-lg transition-all duration-200 col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#ae9efd]">
                    {stats?.activeCards || cards.filter(card => card.status === 'activated').length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-[#ae9efd]/70">Ativos</div>
                </div>
              </div>
            </div>
          </div>

          {/* CARDS SECTION */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#ae9efd]">Meus Cartões</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-[#ae9efd]/70">
                  {cards.length} {cards.length === 1 ? 'cartão criado' : 'cartões criados'}
                </p>
              </div>

              <Button 
                onClick={handleCreateCard} 
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>Criar Cartão</span>
              </Button>
            </div>

            {/* ULTRA-RESPONSIVE CARDS GRID */}
            {cards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="group relative bg-white/90 dark:bg-[#020818]/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-[#ae9efd]/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

                    {/* Card Preview */}
                    <div className={`h-28 sm:h-32 bg-gradient-to-r ${getThemeGradient(card.color_theme || card.theme)} p-3 sm:p-4 relative`}>
                      <div className="flex items-start gap-2 sm:gap-3">
                        {/* Profile Avatar */}
                        <div className="flex-shrink-0">
                          {card.profile_picture ? (
                            <img 
                              src={card.profile_picture} 
                              alt={card.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/30"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                            </div>
                          )}
                        </div>
                        
                        {/* Card Info */}
                        <div className="text-white flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base lg:text-lg font-bold truncate">{card.name}</h4>
                          {card.job_title && <p className="text-xs sm:text-sm opacity-90 truncate">{card.job_title}</p>}
                          {card.company && <p className="text-xs opacity-75 truncate">{card.company}</p>}
                        </div>
                      </div>

                      {/* Premium Badge */}
                      {card.isPremium && (
                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                            PREMIUM
                          </span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 right-10 sm:right-12">
                        <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full ${
                          card.status === 'activated' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300'
                        }`}>
                          {card.status === 'activated' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Card Menu */}
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCardMenu(showCardMenu === card.id ? null : card.id);
                          }}
                          className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </button>

                        {showCardMenu === card.id && (
                          <div className="absolute right-0 top-8 w-44 sm:w-48 bg-white dark:bg-[#020818] rounded-lg shadow-lg border border-gray-200 dark:border-[#ae9efd]/20 py-1 z-10">
                            <button 
                              onClick={() => handleViewCard(card)}
                              className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-[#ae9efd] hover:bg-gray-100 dark:hover:bg-[#ae9efd]/10"
                            >
                              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Visualizar
                            </button>
                            <button 
                              onClick={() => handleEditCard(card)}
                              className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-[#ae9efd] hover:bg-gray-100 dark:hover:bg-[#ae9efd]/10"
                            >
                              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Editar
                            </button>
                            <button 
                              onClick={() => handleShareCard(card)}
                              className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-[#ae9efd] hover:bg-gray-100 dark:hover:bg-[#ae9efd]/10"
                            >
                              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Copiar Link
                            </button>
                            <button 
                              onClick={() => handleDownloadQR(card)}
                              className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-[#ae9efd] hover:bg-gray-100 dark:hover:bg-[#ae9efd]/10"
                            >
                              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              QR Code
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-[#ae9efd]/20" />
                            <button
                              onClick={() => confirmDelete(card)}
                              disabled={isDeleting}
                              className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-3 sm:p-4">
                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                        {card.email && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-[#ae9efd]/70">
                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{card.email}</span>
                          </div>
                        )}
                        {(card.phone || card.whatsapp) && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-[#ae9efd]/70">
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{card.phone || card.whatsapp}</span>
                          </div>
                        )}
                        {card.website && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-[#ae9efd]/70">
                            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{formatWebsiteUrl(card.website)}</span>
                          </div>
                        )}
                        {card.location && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-[#ae9efd]/70">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{card.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 dark:border-[#ae9efd]/20">
                        <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-[#ae9efd]/60">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {card.views || card.click_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {card.downloads || 0}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-[#ae9efd]/50">
                          {card.createdAtFormatted || formatDate(card.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* RESPONSIVE EMPTY STATE */
              <div className="text-center py-8 sm:py-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-[#ae9efd]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-[#ae9efd]/60" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-[#ae9efd] mb-2">
                  Nenhum cartão criado ainda
                </h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-[#ae9efd]/70 mb-6 max-w-md mx-auto">
                  Crie seu primeiro cartão digital e comece a compartilhar suas informações profissionais
                </p>
                <Button 
                  onClick={handleCreateCard}
                  className="mx-auto"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Criar Primeiro Cartão</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;