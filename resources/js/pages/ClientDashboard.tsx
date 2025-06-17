import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
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
  CheckCircle
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  plan: string;
  created_at: string;
}

interface Card {
  id: number;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  location?: string;
  theme: string;
  code: string;
  unique_slug?: string;
  profile_picture?: string;
  logo?: string;
  views: number;
  downloads: number;
  status: string;
  isPremium?: boolean;
  createdAt: string;
  createdAtFormatted: string;
  cardUrl: string;
  editUrl?: string;
  qrUrl?: string;
}

interface Stats {
  totalCards: number;
  totalViews: number;
  totalDownloads: number;
  activeCards: number;
  premiumCards?: number;
}

interface PageProps {
  user?: User;
  userCards?: Card[];
  stats?: Stats;
  // Handle potential different prop names from your controller
  auth?: {
    user: User;
  };
  cards?: Card[];
}

const ClientDashboard: React.FC = () => {
  const pageProps = usePage<PageProps>().props;
  
  // Handle different possible prop structures
  const user = pageProps.user || pageProps.auth?.user || {
    id: 0,
    name: 'User',
    email: 'user@example.com',
    plan: 'Free',
    created_at: new Date().toLocaleDateString()
  };
  
  const userCards = pageProps.userCards || pageProps.cards || [];
  const stats = pageProps.stats || {
    totalCards: userCards.length,
    totalViews: userCards.reduce((sum, card) => sum + (card.views || 0), 0),
    totalDownloads: userCards.reduce((sum, card) => sum + (card.downloads || 0), 0),
    activeCards: userCards.filter(card => card.status === 'activated').length,
    premiumCards: userCards.filter(card => card.isPremium).length,
  };

  const [darkMode, setDarkMode] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState<number | null>(null);
  const [cards, setCards] = useState<Card[]>(userCards);

  // Debug logging
  console.log('Page Props:', pageProps);
  console.log('User:', user);
  console.log('Cards:', cards);
  console.log('Stats:', stats);

  const handleDeleteCard = (cardId: number) => {
    if (!confirm('Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.')) {
      return;
    }

    // Call backend to delete card
    router.delete(`/client/cards/${cardId}`, {
      onSuccess: () => {
        setCards(cards => cards.filter(card => card.id !== cardId));
        setShowCardMenu(null);
        alert('Cartão excluído com sucesso!');
      },
      onError: (errors) => {
        console.error('Delete error:', errors);
        alert('Erro ao excluir cartão. Tente novamente.');
      }
    });
  };

  const handleEditCard = (card: Card) => {
    // Navigate to edit page
    if (card.editUrl) {
      router.visit(card.editUrl);
    } else {
      // Fallback to create page with prefilled data
      router.visit('/create-card', {
        data: {
          edit_card_id: card.id,
          prefill: {
            name: card.name,
            job_title: card.title,
            company: card.company,
            email: card.email,
            phone: card.phone,
            whatsapp: card.whatsapp,
            website: card.website,
            location: card.location,
            color_theme: card.theme.replace('gradient-', ''),
            profile_picture: card.profile_picture,
            logo: card.logo
          }
        }
      });
    }
  };

  const handleViewCard = (card: Card) => {
    // Open card in new tab
    window.open(card.cardUrl, '_blank');
  };

  const handleShareCard = (card: Card) => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(card.cardUrl).then(() => {
      alert('Link copiado para a área de transferência!');
      setShowCardMenu(null);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = card.cardUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Link copiado para a área de transferência!');
      } catch (err) {
        alert('Link do cartão: ' + card.cardUrl);
      }
      document.body.removeChild(textArea);
      setShowCardMenu(null);
    });
  };

  const handleDownloadQR = (card: Card) => {
    if (card.qrUrl) {
      window.open(card.qrUrl, '_blank');
    } else {
      // Fallback: show QR URL for manual access
      alert('QR Code disponível em: ' + card.cardUrl);
    }
    setShowCardMenu(null);
  };

  const handleDuplicateCard = (card: Card) => {
    router.post(`/client/cards/${card.id}/duplicate`, {}, {
      onSuccess: (response) => {
        // Refresh the page to show the new card
        router.reload();
        alert('Cartão duplicado com sucesso!');
      },
      onError: (errors) => {
        console.error('Duplicate error:', errors);
        alert('Erro ao duplicar cartão. Tente novamente.');
      }
    });
    setShowCardMenu(null);
  };

  const handleToggleStatus = (card: Card) => {
    const newStatus = card.status === 'activated' ? 'draft' : 'activated';
    const action = newStatus === 'activated' ? 'ativar' : 'desativar';
    
    if (!confirm(`Tem certeza que deseja ${action} este cartão?`)) {
      return;
    }

    router.patch(`/client/cards/${card.id}/toggle-status`, {}, {
      onSuccess: () => {
        // Update local state
        setCards(cards => cards.map(c => 
          c.id === card.id ? { ...c, status: newStatus } : c
        ));
        alert(`Cartão ${newStatus === 'activated' ? 'ativado' : 'desativado'} com sucesso!`);
      },
      onError: (errors) => {
        console.error('Toggle status error:', errors);
        alert('Erro ao alterar status do cartão. Tente novamente.');
      }
    });
    setShowCardMenu(null);
  };

  const handleLogout = () => {
    router.post('/logout');
  };

  const handleGoBack = () => {
    router.visit('/');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getThemeGradient = (theme: string) => {
    const themes: Record<string, string> = {
      'gradient-purple': 'from-purple-600 to-blue-600',
      'gradient-blue': 'from-blue-600 to-cyan-600', 
      'gradient-green': 'from-green-600 to-emerald-600',
      'gradient-red': 'from-red-600 to-pink-600',
      'gradient-orange': 'from-orange-600 to-amber-600'
    };
    return themes[theme] || themes['gradient-purple'];
  };

  const formatWebsiteUrl = (website?: string) => {
    if (!website) return '';
    if (website.startsWith('http')) return website;
    return website.replace(/^(https?:\/\/)/, '');
  };

  // Handle clicks outside of menu to close it
  React.useEffect(() => {
    const handleClickOutside = () => setShowCardMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <Head title="Minha Conta - Capinha Digital" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">

        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Back button and title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Voltar</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Minha Conta</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie seus cartões digitais</p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || 'Usuário'}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{user.email || 'email@exemplo.com'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                      Plano {user.plan || 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCards}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Cartões</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Visualizações</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Downloads</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeCards}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Ativos</div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Cartões</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {cards.length} {cards.length === 1 ? 'cartão criado' : 'cartões criados'}
                </p>
              </div>

              <button onClick={() => router.visit('/create-card')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>Criar Cartão</span>
              </button>
            </div>

            {/* Cards Grid */}
            {cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

                    {/* Card Preview */}
                    <div className={`h-32 bg-gradient-to-r ${getThemeGradient(card.theme)} p-4 relative`}>
                      <div className="text-white">
                        <h4 className="text-lg font-bold">{card.name}</h4>
                        {card.title && <p className="text-sm opacity-90">{card.title}</p>}
                        {card.company && <p className="text-xs opacity-75">{card.company}</p>}
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
                          <div 
                            className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={() => handleViewCard(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Visualizar
                            </button>
                            <button 
                              onClick={() => handleEditCard(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit3 className="w-4 h-4" />
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDuplicateCard(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicar
                            </button>
                            <button 
                              onClick={() => handleShareCard(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Share2 className="w-4 h-4" />
                              Compartilhar
                            </button>
                            <button 
                              onClick={() => handleDownloadQR(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <QrCode className="w-4 h-4" />
                              QR Code
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(card)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {card.status === 'activated' ? 'Desativar' : 'Ativar'}
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-600" />
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-4">
                      <div className="space-y-2 mb-4">
                        {card.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{card.email}</span>
                          </div>
                        )}
                        {card.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            {card.phone}
                          </div>
                        )}
                        {card.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Globe className="w-4 h-4" />
                            <span className="truncate">{formatWebsiteUrl(card.website)}</span>
                          </div>
                        )}
                        {card.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {card.location}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {card.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {card.downloads || 0}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {card.createdAtFormatted}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-12 h-12 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum cartão criado ainda
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crie seu primeiro cartão digital e comece a compartilhar suas informações profissionais
                </p>
                <button 
                  onClick={() => router.visit('/create-card')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Criar Primeiro Cartão</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;