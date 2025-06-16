import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(null);

  // Mock user data
  const user = {
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-9999",
    plan: "Premium"
  };

  // Mock cards data
  const [userCards, setUserCards] = useState([
    {
      id: 1,
      name: "João Silva",
      title: "Designer Gráfico",
      company: "Creative Studio",
      email: "joao@creativestudio.com",
      phone: "(11) 99999-9999",
      website: "www.joaosilva.design",
      location: "São Paulo, SP",
      theme: "gradient-purple",
      qrCode: "QR123456",
      views: 245,
      downloads: 32,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "João Silva",
      title: "Consultor de Marketing",
      company: "Marketing Pro",
      email: "joao@marketingpro.com",
      phone: "(11) 88888-8888",
      website: "www.marketingpro.com",
      location: "São Paulo, SP",
      theme: "gradient-blue",
      qrCode: "QR789012",
      views: 156,
      downloads: 28,
      createdAt: "2024-02-10"
    }
  ]);

  const handleDeleteCard = (cardId) => {
    setUserCards(cards => cards.filter(card => card.id !== cardId));
    setShowCardMenu(null);
  };

  const handleLogout = () => {
    // Implement logout logic
    router.post(route('logout'));
  };

  const handleGoBack = () => {
    // Implement back navigation
    console.log('Going back...');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getThemeGradient = (theme) => {
    const themes = {
      'gradient-purple': 'from-purple-600 to-blue-600',
      'gradient-blue': 'from-blue-600 to-cyan-600',
      'gradient-green': 'from-green-600 to-emerald-600',
      'gradient-red': 'from-red-600 to-pink-600'
    };
    return themes[theme] || themes['gradient-purple'];
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                      Plano {user.plan}
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Cartões</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {userCards.length} {userCards.length === 1 ? 'cartão criado' : 'cartões criados'}
                </p>
              </div>

              <button onClick={() => {
                router.visit('/purchase')
              }} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>Criar Cartão</span>
              </button>
            </div>

            {/* Cards Grid */}
            {userCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCards.map((card) => (
                  <div key={card.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

                    {/* Card Preview */}
                    <div className={`h-32 bg-gradient-to-r ${getThemeGradient(card.theme)} p-4 relative`}>
                      <div className="text-white">
                        <h4 className="text-lg font-bold">{card.name}</h4>
                        <p className="text-sm opacity-90">{card.title}</p>
                        <p className="text-xs opacity-75">{card.company}</p>
                      </div>

                      {/* Card Menu */}
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => setShowCardMenu(showCardMenu === card.id ? null : card.id)}
                          className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-white" />
                        </button>

                        {showCardMenu === card.id && (
                          <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Eye className="w-4 h-4" />
                              Visualizar
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Edit3 className="w-4 h-4" />
                              Editar
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Share2 className="w-4 h-4" />
                              Compartilhar
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Download className="w-4 h-4" />
                              Download
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
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          {card.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          {card.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Globe className="w-4 h-4" />
                          {card.website}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {card.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {card.downloads}
                          </span>
                        </div>
                        <QrCode className="w-5 h-5 text-gray-400" />
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
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto">
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

export default Dashboard;