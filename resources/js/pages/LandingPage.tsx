import React, { useState, useEffect } from 'react';
import { Card, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Head, router, usePage } from '@inertiajs/react';
import {
  Smartphone,
  Zap,
  Globe,
  User,
  Star,
  ArrowRight,
  Check,
  Play,
  Moon,
  Sun,
  Menu,
  X,
  QrCode,
  Share2,
  BarChart3,
  Shield,
  Palette,
  Contact,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  auth?: {
    user?: {
      id: number;
      name: string;
      email: string;
    }
  };
  hasValidPayment?: boolean;
}

const DigitalCardLanding = () => {
  const { props } = usePage<LandingPageProps>();
  const { auth, hasValidPayment } = props;

  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState('');
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      content: "Revolucionou a forma como compartilho meus contatos. Profissional e moderno!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Consultor",
      content: "A melhor solução para networking digital. Recomendo para todos os profissionais.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Designer",
      content: "Interface incrível e funcionalidades completas. Meu cartão digital favorito!",
      rating: 5
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "R$ 39,90",
      period: "/mês",
      features: [
        "Cartão digital personalizado",
        "QR Code dinâmico",
        "Links para redes sociais",
        "Edição ilimitada",
        "Suporte por email",
      ],
      popular: false,
      planKey: "basic"
    },
    {
      name: "Profissional",
      price: "R$ 69,90",
      period: "/mês",
      features: [
        "Tudo do plano Básico",
        "Analytics detalhado",
        "Logo personalizada no QR",
        "Múltiplos temas de cor",
        "Suporte prioritário",
        "Download de contatos (vCard)"
      ],
      popular: true,
      planKey: "premium"
    },
    {
      name: "Empresarial",
      price: "R$ 199,90",
      period: "/mês",
      features: [
        "Tudo do plano Premium",
        "Até 5 cartões digitais",
        "Gestão centralizada",
        "Branding corporativo",
        "Relatórios avançados",
        "Suporte dedicado"
      ],
      popular: false,
      planKey: "business"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--dark-bg', '#020818');
      document.documentElement.style.setProperty('--dark-text', '#ae9efd');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleStartNow = () => {
    router.visit('/client/dashboard');
  };

  const handlePlanSelection = (planKey: string) => {
    router.visit(`/purchase?plan=${planKey}`);
  };

  const handleCreateCard = () => {
    router.visit('/purchase');
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark' : ''}`}
      style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#ffffff', color: '#1f2937' }}>
      <Head title="DigitalCard - Cartões de Visita Digitais Inteligentes" />

      {/* Payment Alert Modal */}
      {showPaymentAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl max-w-md w-full p-6 space-y-4 mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-orange-900/20' : 'bg-orange-100'}`}>
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pagamento Necessário
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Para criar seu cartão digital
                </p>
              </div>
            </div>

            <div className={`border rounded-lg p-4 ${darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className={`font-medium mb-1 ${darkMode ? 'text-orange-200' : 'text-orange-800'}`}>
                    Compre um plano para continuar
                  </p>
                  <p className={`${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    Você precisa adquirir um de nossos planos para criar seu cartão digital personalizado.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setShowPaymentAlert(false);
                  router.visit('/purchase');
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Ver Planos
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentAlert(false)}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-all duration-300 ${darkMode
          ? 'bg-gray-900/80 border-gray-700'
          : 'bg-white/80 border-gray-200'
        }`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center">
                {/* <Contact className="w-4 h-4 sm:w-6 sm:h-6 text-white" /> */}
                <img src="/images/capinha-logo.png" className="rounded-lg"
                  alt="Capinha Digital" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                DigitalCard
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <button onClick={() => scrollToSection('features')} className={`transition-colors ${darkMode
                  ? 'text-gray-300 hover:text-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
                }`}>
                Recursos
              </button>
              <button onClick={() => scrollToSection('pricing')} className={`transition-colors ${darkMode
                  ? 'text-gray-300 hover:text-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
                }`}>
                Preços
              </button>
              <button onClick={() => scrollToSection('testimonials')} className={`transition-colors ${darkMode
                  ? 'text-gray-300 hover:text-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
                }`}>
                Depoimentos
              </button>

              {/* Theme Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-purple-600"
                />
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>

              {/* User Status */}
              {auth?.user ? (
                <div className="flex items-center space-x-3 xl:space-x-4">
                  <button
                    onClick={() => router.visit('/client/dashboard')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${darkMode
                        ? 'bg-green-900/20 text-green-300 hover:bg-green-900/30'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden xl:inline">Dashboard</span>
                  </button>
                  <button
                    onClick={handleCreateCard}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${darkMode
                        ? 'bg-blue-900/20 text-blue-300 hover:bg-blue-900/30'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden xl:inline">Criar Cartão</span>
                  </button>
                  <span className={`text-sm hidden lg:inline ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Olá, {auth.user.name}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => router.visit('/auth/redirect')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <User className="w-4 h-4" />
                  <span>Entrar</span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-4 animate-in slide-in-from-top duration-200">
              <button onClick={() => scrollToSection('features')} className={`block w-full text-left transition-colors ${darkMode
                  ? 'text-gray-300 hover:text-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
                }`}>
                Recursos
              </button>
              <button onClick={() => scrollToSection('pricing')} className={`block w-full text-left transition-colors ${darkMode
                  ? 'text-gray-300 hover:text-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
                }`}>
                Preços
              </button>
              <button onClick={() => scrollToSection('testimonials')} className={`block w-full text-left transition-colors ${darkMode
                  ? 'text-gray-300 hover:text-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
                }`}>
                Depoimentos
              </button>

              {/* Mobile Theme Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-purple-600"
                />
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span className="text-sm">Modo Escuro</span>
              </div>

              {/* Mobile User Status */}
              {auth?.user ? (
                <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Olá, {auth.user.name}
                  </p>
                  <button
                    onClick={() => router.visit('/client/dashboard')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 w-full justify-center ${darkMode
                        ? 'bg-green-900/20 text-green-300 hover:bg-green-900/30'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleCreateCard}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 w-full justify-center ${darkMode
                        ? 'bg-blue-900/20 text-blue-300 hover:bg-blue-900/30'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Criar Cartão</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.visit('/auth/redirect')}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg w-full justify-center mt-4"
                >
                  <User className="w-4 h-4" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 min-h-screen flex items-center">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-left duration-1000">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Cartões Digitais
                  </span>
                  <br />
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                    Inteligentes
                  </span>
                </h1>
                <p className={`text-lg sm:text-xl max-w-2xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Transforme sua presença profissional com cartões de visita digitais modernos,
                  interativos e sustentáveis. Compartilhe seus contatos instantaneamente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleStartNow}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Ir ao Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl border-2 transition-all duration-300 ${darkMode
                      ? 'hover:bg-gray-800 border-gray-600'
                      : 'hover:bg-gray-50 border-gray-300'
                    }`}
                >
                  <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Ver Demo
                </Button>
              </div>

              <div className={`flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 border-2 border-white dark:border-gray-900"></div>
                    ))}
                  </div>
                  <span>+10.000 usuários</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2">4.9/5</span>
                </div>
              </div>
            </div>

            <div className="relative animate-in slide-in-from-right duration-1000 delay-300 mt-8 lg:mt-0">
              <div className="relative z-10">
                <Card className={`p-6 sm:p-8 backdrop-blur-sm border-0 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 ${darkMode
                    ? 'bg-gray-800/80'
                    : 'bg-white/80'
                  }`}>
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-auto flex items-center justify-center">
                      <span className="text-xl sm:text-2xl text-white font-bold">JS</span>
                    </div>
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>João Silva</h3>
                      <p className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Designer & Desenvolvedor</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className={`flex items-center justify-center space-x-2 p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                        <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">+55 11 99999-9999</span>
                      </div>
                      <div className={`flex items-center justify-center space-x-2 p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                        <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">joaosilva.dev</span>
                      </div>
                    </div>
                    <QrCode className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                </Card>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-16 sm:py-24 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Recursos Poderosos
              </span>
            </h2>
            <p className={`text-lg sm:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tudo que você precisa para criar uma presença digital profissional e impactante
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <QrCode className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "QR Code Inteligente",
                description: "Compartilhe instantaneamente com QR codes personalizados e dinâmicos",
                gradient: "from-purple-500 to-blue-500"
              },
              {
                icon: <Share2 className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Compartilhamento Fácil",
                description: "NFC, link direto, redes sociais - múltiplas formas de compartilhar",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Analytics Avançado",
                description: "Acompanhe visualizações, cliques e engajamento em tempo real",
                gradient: "from-cyan-500 to-green-500"
              },
              {
                icon: <Palette className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Design Personalizado",
                description: "Templates profissionais e totalmente personalizáveis",
                gradient: "from-green-500 to-yellow-500"
              },
              {
                icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Segurança Total",
                description: "Seus dados protegidos com criptografia de ponta",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Atualizações Instantâneas",
                description: "Modifique suas informações e todos os contatos são atualizados",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className={`p-6 sm:p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-in slide-in-from-bottom delay-100 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Planos Flexíveis
              </span>
            </h2>
            <p className={`text-lg sm:text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Escolha o plano ideal para suas necessidades profissionais
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:scale-105 animate-in slide-in-from-bottom delay-200 ${plan.popular
                    ? `border-2 border-purple-500 ${darkMode ? 'bg-purple-900/20' : 'bg-gradient-to-br from-purple-50 to-blue-50'}`
                    : darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'
                  }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold">
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6 sm:mb-8">
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className={`text-sm sm:text-base ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanSelection(plan.planKey)}
                  className={`w-full py-4 sm:py-6 text-base sm:text-lg rounded-xl transition-all duration-300 ${plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                >
                  Escolher Plano
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-16 sm:py-24 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                O Que Dizem Nossos Clientes
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className={`p-8 sm:p-12 text-center relative overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'
              }`}>
              <div className={`absolute inset-0 ${darkMode
                  ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20'
                  : 'bg-gradient-to-br from-purple-100/50 to-blue-100/50'
                }`}></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4 sm:mb-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 fill-yellow-400 text-yellow-400 mx-1" />
                  ))}
                </div>

                <blockquote className={`text-xl sm:text-2xl lg:text-3xl font-medium mb-6 sm:mb-8 leading-relaxed ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="space-y-2">
                  <p className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {testimonials[currentTestimonial].name}
                  </p>
                  <p className={`text-sm sm:text-base ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>

                <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentTestimonial
                          ? 'bg-purple-600 w-6 sm:w-8'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white">
              Pronto para Revolucionar
              <br />
              Seu Networking?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já transformaram sua presença digital
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-0 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70"
              />
              <Button
                size="lg"
                onClick={handleStartNow}
                className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl font-bold transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                Ir ao Dashboard
              </Button>
            </div>

            <p className="text-white/80 text-sm">
              Sem cartão de crédito • Cancelamento gratuito • Suporte 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 sm:py-12 text-white ${darkMode ? 'bg-black' : 'bg-gray-900'}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center">
                   <img src="/images/capinha-logo.png" className="rounded-lg"
                  alt="Capinha Digital" />
                </div>
                <span className="text-xl sm:text-2xl font-bold">DigitalCard</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Transformando conexões profissionais com tecnologia de ponta.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Produto</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Suporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
          </div>

          <div className={`border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base ${darkMode ? 'border-gray-800' : 'border-gray-800'
            }`}>
            <p>&copy; 2025 DigitalCard. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DigitalCardLanding;