import React, { useState, useEffect } from 'react';
import { Card, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Head, router } from '@inertiajs/react';
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
  Contact
} from 'lucide-react';

const DigitalCardLanding = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState('');

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
      price: "R$ 39.90",
      period: "/mês",
      features: [
        "Cartão digital personalizado",
        "QR Code dinâmico",
        "Links para redes sociais",
        "Edição ilimitada",
        "Suporte por email",
      ],
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 69.90",
      period: "/mês",
      features: [
        "Tudo do plano Básico",
        "Analytics detalhado",
        "Logo personalizada no QR",
        "Múltiplos temas de cor",
        "Suporte prioritário",
        "Download de contatos (vCard)"
      ],
      popular: true
    },
    {
      name: "Empresarial",
      price: "R$ 199.90",
      period: "/mês",
      features: [
        "Tudo do plano Premium",
        "Até 5 cartões digitais",
        "Gestão centralizada",
        "Branding corporativo",
        "Relatórios avançados",
        "Suporte dedicado"
      ],
      popular: false
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
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Contact className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                DigitalCard
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Recursos
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Preços
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
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

              {/* Login Button */}
              <button
                onClick={() => router.visit('/auth/redirect')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <User className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 animate-in slide-in-from-top duration-200">
              <button onClick={() => scrollToSection('features')} className="block text-gray-600 dark:text-gray-300 hover:text-purple-600 transition-colors">
                Recursos
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block text-gray-600 dark:text-gray-300 hover:text-purple-600 transition-colors">
                Preços
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="block text-gray-600 dark:text-gray-300 hover:text-purple-600 transition-colors">
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
              </div>

              {/* Mobile Login Button */}
              <button
                onClick={() => router.visit('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg w-full justify-center"
              >
                <User className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 min-h-screen flex items-center">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-1000">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Cartões Digitais
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-white">
                    Inteligentes
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  Transforme sua presença profissional com cartões de visita digitais modernos,
                  interativos e sustentáveis. Compartilhe seus contatos instantaneamente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    router.get('/client/dashboard')
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Ver Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 border-2 border-white dark:border-gray-900"></div>
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

            <div className="relative animate-in slide-in-from-right duration-1000 delay-300">
              <div className="relative z-10">
                <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-auto flex items-center justify-center">
                      <span className="text-2xl text-white font-bold">JS</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">João Silva</h3>
                      <p className="text-purple-600 dark:text-purple-400">Designer & Desenvolvedor</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-center space-x-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Smartphone className="w-4 h-4" />
                        <span>+55 11 99999-9999</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Globe className="w-4 h-4" />
                        <span>joaosilva.dev</span>
                      </div>
                    </div>
                    <QrCode className="w-16 h-16 mx-auto text-gray-400" />
                  </div>
                </Card>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Recursos Poderosos
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Tudo que você precisa para criar uma presença digital profissional e impactante
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <QrCode className="w-8 h-8" />,
                title: "QR Code Inteligente",
                description: "Compartilhe instantaneamente com QR codes personalizados e dinâmicos",
                gradient: "from-purple-500 to-blue-500"
              },
              {
                icon: <Share2 className="w-8 h-8" />,
                title: "Compartilhamento Fácil",
                description: "NFC, link direto, redes sociais - múltiplas formas de compartilhar",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Analytics Avançado",
                description: "Acompanhe visualizações, cliques e engajamento em tempo real",
                gradient: "from-cyan-500 to-green-500"
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Design Personalizado",
                description: "Templates profissionais e totalmente personalizáveis",
                gradient: "from-green-500 to-yellow-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Segurança Total",
                description: "Seus dados protegidos com criptografia de ponta",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Atualizações Instantâneas",
                description: "Modifique suas informações e todos os contatos são atualizados",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-in slide-in-from-bottom delay-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Planos Flexíveis
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Escolha o plano ideal para suas necessidades profissionais
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`p-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:scale-105 animate-in slide-in-from-bottom delay-200 ${plan.popular
                  ? 'border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
                  : ''
                  }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-6 text-lg rounded-xl transition-all duration-300 ${plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
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
      <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                O Que Dizem Nossos Clientes
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400 mx-1" />
                  ))}
                </div>

                <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 dark:text-white mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="space-y-2">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {testimonials[currentTestimonial].name}
                  </p>
                  <p className="text-purple-600 dark:text-purple-400">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>

                <div className="flex justify-center mt-8 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial
                        ? 'bg-purple-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-600'
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
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-1000">
            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              Pronto para Revolucionar
              <br />
              Seu Networking?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já transformaram sua presença digital
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-6 py-4 text-lg rounded-xl border-0 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70"
              />
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
              >
                Começar Grátis
              </Button>
            </div>

            <p className="text-white/80 text-sm">
              Sem cartão de crédito • Cancelamento gratuito • Suporte 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Contact className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">DigitalCard</span>
              </div>
              <p className="text-gray-400">
                Transformando conexões profissionais com tecnologia de ponta.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DigitalCard. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DigitalCardLanding;