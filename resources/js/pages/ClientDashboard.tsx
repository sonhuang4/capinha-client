import React, { useState } from 'react';
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
  X
} from 'lucide-react';

// UI Components (same as RequestCardForm)
const Button = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false,
  children, 
  ...props 
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "hover:bg-gray-100 text-gray-700"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
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

const Alert = ({ variant = 'default', className = '', children, onClose, ...props }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800"
  };
  
  return (
    <div className={`p-4 rounded-md border ${variants[variant]} ${className} relative`} {...props}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded hover:bg-black/10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
};

const AlertDescription = ({ className = '', children, ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, description, confirmText = "Confirmar", confirmVariant = "destructive" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
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
const navigateToRoute = (path) => {
  window.location.href = path;
};

const submitForm = async (url, data, method = 'POST') => {
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
  } catch (error) {
    return { success: false, errors: { general: error.message } };
  }
};

const ClientDashboard = ({ user, userCards, stats }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(null);
  const [cards, setCards] = useState(userCards || []);
  const [alert, setAlert] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, cardId: null, cardName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  console.log('=== DASHBOARD PROPS DEBUG ===');
  console.log('user:', user);
  console.log('userCards:', userCards);
  console.log('stats:', stats);
  console.log('============================');

  const showAlert = (message, type = 'default', duration = 5000) => {
    setAlert({ message, type });
    if (duration > 0) {
      setTimeout(() => setAlert(null), duration);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (isDeleting) return;

    setIsDeleting(true);
    setConfirmModal({ isOpen: false, cardId: null, cardName: '' });

    try {
      console.log('Deleting card ID:', cardId);
      
      const result = await submitForm(`/client/cards/${cardId}`, {}, 'DELETE');
      
      if (result.success) {
        // Remove card from local state
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

  const confirmDelete = (card) => {
    setConfirmModal({
      isOpen: true,
      cardId: card.id,
      cardName: card.name
    });
    setShowCardMenu(null);
  };

  const handleEditCard = (card) => {
    console.log('Editing card:', card);
    
    // Navigate to edit page with prefilled data
    const editUrl = `/client/cards/${card.id}/edit`;
    navigateToRoute(editUrl);
  };

  const handleViewCard = (card) => {
    const cardUrl = card.cardUrl || card.card_url || `/c/${card.code}`;
    window.open(cardUrl, '_blank');
  };

  const handleShareCard = async (card) => {
    const cardUrl = card.cardUrl || card.card_url || `/c/${card.code}`;
    
    try {
      await navigator.clipboard.writeText(cardUrl);
      showAlert('✅ Link copiado para a área de transferência!', 'success');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      showAlert(`📋 Link do cartão: ${cardUrl}`, 'default', 0);
    }
    setShowCardMenu(null);
  };

  const handleDownloadQR = (card) => {
    const qrUrl = card.qrUrl || `/cards/${card.id}/qr`;
    window.open(qrUrl, '_blank');
    setShowCardMenu(null);
  };

  const handleLogout = async () => {
    try {
      await submitForm('/logout', {}, 'POST');
      navigateToRoute('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigateToRoute('/login'); // Fallback
    }
  };

  const handleGoBack = () => {
    navigateToRoute('/');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getThemeGradient = (theme) => {
    const themes = {
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
    return themes[theme] || themes['blue'];
  };

  const formatWebsiteUrl = (website) => {
    if (!website) return '';
    if (website.startsWith('http')) return website;
    return website.replace(/^(https?:\/\/)/, '');
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowCardMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">

        {/* Alert */}
        {alert && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
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
          onConfirm={() => handleDeleteCard(confirmModal.cardId)}
          title="Excluir Cartão"
          description={`Tem certeza que deseja excluir o cartão "${confirmModal.cardName}"? Esta ação não pode ser desfeita.`}
          confirmText={isDeleting ? "Excluindo..." : "Excluir"}
          confirmVariant="destructive"
        />

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Back button and title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Voltar</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Minha Conta</h1>
                  <p className="text-sm text-gray-500">Gerencie seus cartões digitais</p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Usuário'}</h2>
                  <p className="text-gray-600">{user?.email || 'email@exemplo.com'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                      Plano {user?.plan || 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats?.totalCards || cards.length}</div>
              <div className="text-sm text-gray-500">Cartões</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats?.totalViews || cards.reduce((sum, card) => sum + (card.views || card.click_count || 0), 0)}</div>
              <div className="text-sm text-gray-500">Visualizações</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats?.totalDownloads || 0}</div>
              <div className="text-sm text-gray-500">Downloads</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats?.activeCards || cards.filter(card => card.status === 'activated').length}</div>
              <div className="text-sm text-gray-500">Ativos</div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Meus Cartões</h3>
                <p className="text-gray-600">
                  {cards.length} {cards.length === 1 ? 'cartão criado' : 'cartões criados'}
                </p>
              </div>

              <Button 
                onClick={() => navigateToRoute('/create-card')} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Cartão</span>
              </Button>
            </div>

            {/* Cards Grid */}
            {cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

                    {/* Card Preview */}
                    <div className={`h-32 bg-gradient-to-r ${getThemeGradient(card.color_theme || card.theme)} p-4 relative`}>
                      <div className="flex items-start gap-3">
                        {/* Profile Avatar Only */}
                        <div className="flex-shrink-0">
                          {card.profile_picture ? (
                            <img 
                              src={card.profile_picture} 
                              alt={card.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                              <User className="w-6 h-6 text-white/80" />
                            </div>
                          )}
                        </div>
                        
                        {/* Card Info */}
                        <div className="text-white flex-1 min-w-0">
                          <h4 className="text-lg font-bold truncate">{card.name}</h4>
                          {card.job_title && <p className="text-sm opacity-90 truncate">{card.job_title}</p>}
                          {card.company && <p className="text-xs opacity-75 truncate">{card.company}</p>}
                        </div>
                      </div>

                      {/* Premium Badge */}
                      {card.isPremium && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                            PREMIUM
                          </span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 right-12">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          card.status === 'activated' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {card.status === 'activated' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Card Menu */}
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCardMenu(showCardMenu === card.id ? null : card.id);
                          }}
                          className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-white" />
                        </button>

                        {showCardMenu === card.id && (
                          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button 
                              onClick={() => handleViewCard(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Visualizar
                            </button>
                            <button 
                              onClick={() => handleEditCard(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit3 className="w-4 h-4" />
                              Editar
                            </button>
                            <button 
                              onClick={() => handleShareCard(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Copy className="w-4 h-4" />
                              Copiar Link
                            </button>
                            <button 
                              onClick={() => handleDownloadQR(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <QrCode className="w-4 h-4" />
                              QR Code
                            </button>
                            <hr className="my-1 border-gray-200" />
                            <button
                              onClick={() => confirmDelete(card)}
                              disabled={isDeleting}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-4">
                      <div className="space-y-2 mb-4">
                        {card.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{card.email}</span>
                          </div>
                        )}
                        {(card.phone || card.whatsapp) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {card.phone || card.whatsapp}
                          </div>
                        )}
                        {card.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="w-4 h-4" />
                            <span className="truncate">{formatWebsiteUrl(card.website)}</span>
                          </div>
                        )}
                        {card.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {card.location}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {card.views || card.click_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {card.downloads || 0}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {card.createdAtFormatted || new Date(card.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-12 h-12 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum cartão criado ainda
                </h4>
                <p className="text-gray-600 mb-6">
                  Crie seu primeiro cartão digital e comece a compartilhar suas informações profissionais
                </p>
                <Button 
                  onClick={() => navigateToRoute('/create-card')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
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