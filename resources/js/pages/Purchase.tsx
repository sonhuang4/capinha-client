import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Check,
  Star,
  Shield,
  Zap,
  Users,
  CreditCard,
  Smartphone,
  Mail,
  Phone,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface PurchasePageProps {
  selectedPlan?: string;
}

const PurchasePage: React.FC<PurchasePageProps> = ({ selectedPlan = 'basic' }) => {
  const [currentPlan, setCurrentPlan] = useState(selectedPlan);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '', // CPF
  });

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

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 39.90,
      originalPrice: 59.90,
      description: 'Perfeito para profissionais individuais',
      features: [
        'Cartão digital personalizado',
        'QR Code dinâmico',
        'Links para redes sociais',
        'Edição ilimitada',
        'Suporte por email',
      ],
      badge: 'Mais Popular',
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 69.90,
      originalPrice: 99.90,
      description: 'Para profissionais que querem se destacar',
      features: [
        'Tudo do plano Básico',
        'Analytics detalhado',
        'Logo personalizada no QR',
        'Múltiplos temas de cor',
        'Suporte prioritário',
        'Download de contatos (vCard)',
      ],
      badge: 'Recomendado',
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'business',
      name: 'Empresarial',
      price: 199.90,
      originalPrice: 299.90,
      description: 'Para equipes e empresas',
      features: [
        'Tudo do plano Premium',
        'Até 5 cartões digitais',
        'Gestão centralizada',
        'Branding corporativo',
        'Relatórios avançados',
        'Suporte dedicado',
      ],
      badge: 'Melhor Valor',
      badgeColor: 'bg-emerald-500',
    },
  ];

  const selectedPlanData = plans.find(plan => plan.id === currentPlan) || plans[0];

  const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isFormValid = () => {
    return customerForm.name.trim() !== '' &&
      customerForm.email.trim() !== '' &&
      customerForm.phone.trim() !== '';
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsProcessing(true);

    try {
      const purchaseData = {
        plan: currentPlan,
        payment_method: paymentMethod,
        customer: customerForm,
        amount: selectedPlanData.price,
      };

      // Submit to Laravel backend
      router.post('/purchase/process', purchaseData, {
        onSuccess: (response) => {
          // Will redirect to payment confirmation or card creator
        },
        onError: (errors) => {
          console.error('Purchase failed:', errors);
          alert('Erro no pagamento. Tente novamente.');
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Purchase error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen py-6 sm:py-8 px-4 transition-all duration-300 ${darkMode ? 'dark' : ''}`}
         style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#ffffff', color: '#1f2937' }}>
      <Head title="Finalizar Compra - DigitalCard" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4">
          <Link href="/" className={`flex items-center gap-2 text-sm transition-colors ${
            darkMode 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}>
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              DigitalCard
            </h1>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Finalize sua compra
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-purple-600 scale-75 sm:scale-100"
            />
            {darkMode ? <Moon className="w-3 h-3 sm:w-4 sm:h-4" /> : <Sun className="w-3 h-3 sm:w-4 sm:h-4" />}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${
              darkMode 
                ? 'bg-blue-900/30 text-blue-300' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>1. Pagamento</span>
            </div>
            <div className={`w-4 sm:w-8 h-0.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${
              darkMode 
                ? 'bg-gray-800 text-gray-400' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>2. Criar Cartão</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Plans Selection */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Escolha seu plano
              </h2>

              <div className="grid gap-3 sm:gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentPlan === plan.id
                        ? darkMode
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-blue-500 bg-blue-50'
                        : darkMode
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentPlan(plan.id)}
                  >
                    {plan.badge && (
                      <Badge className={`absolute -top-2 left-2 sm:left-4 ${plan.badgeColor} text-white text-xs`}>
                        {plan.badge}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="plan"
                              value={plan.id}
                              checked={currentPlan === plan.id}
                              onChange={() => setCurrentPlan(plan.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <h3 className={`text-base sm:text-lg font-semibold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {plan.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 ml-7 sm:ml-0">
                            <span className="text-lg sm:text-2xl font-bold text-green-600">
                              R$ {plan.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span className={`text-xs sm:text-sm line-through ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              R$ {plan.originalPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>

                        <p className={`text-xs sm:text-sm mb-3 ml-7 sm:ml-0 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {plan.description}
                        </p>

                        <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm ml-7 sm:ml-0">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customer Information */}
            <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Suas informações
              </h2>

              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className={`text-sm font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Nome Completo *
                    </Label>
                    <Input
                      name="name"
                      value={customerForm.name}
                      onChange={handleCustomerFormChange}
                      placeholder="Seu nome completo"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className={`text-sm font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      E-mail *
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={customerForm.email}
                      onChange={handleCustomerFormChange}
                      placeholder="seu@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className={`text-sm font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Telefone/WhatsApp *
                    </Label>
                    <Input
                      name="phone"
                      value={customerForm.phone}
                      onChange={handleCustomerFormChange}
                      placeholder="(11) 99999-9999"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="document" className={`text-sm font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      CPF (Opcional)
                    </Label>
                    <Input
                      name="document"
                      value={customerForm.document}
                      onChange={handleCustomerFormChange}
                      placeholder="000.000.000-00"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className={`text-base sm:text-lg font-semibold mb-4 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Forma de pagamento
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'pix'
                          ? darkMode
                            ? 'border-green-500 bg-green-900/20'
                            : 'border-green-500 bg-green-50'
                          : darkMode
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-green-800' : 'bg-green-100'
                        }`}>
                          <Smartphone className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            darkMode ? 'text-green-300' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <h4 className={`font-medium text-sm sm:text-base ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            PIX
                          </h4>
                          <p className={`text-xs sm:text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Pagamento instantâneo
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'credit'
                          ? darkMode
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-blue-500 bg-blue-50'
                          : darkMode
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-blue-800' : 'bg-blue-100'
                        }`}>
                          <CreditCard className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            darkMode ? 'text-blue-300' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <h4 className={`font-medium text-sm sm:text-base ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Cartão de Crédito
                          </h4>
                          <p className={`text-xs sm:text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Até 12x sem juros
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 space-y-3">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full bg-gradient-to-r from-purple-900 to-blue-600 hover:to-purple-900 hover:from-blue-900 text-white py-3 text-sm sm:text-lg font-semibold rounded-lg"
                  >
                    {isProcessing ? (
                      <span>Processando...</span>
                    ) : (
                      <span>
                        Finalizar Compra - R$ {selectedPlanData.price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 sm:space-y-6">
            <Card className={`p-4 sm:p-6 sticky top-4 sm:top-8 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <h3 className={`text-base sm:text-lg font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Resumo do pedido
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm sm:text-base ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedPlanData.name}
                    </h4>
                    <p className={`text-xs sm:text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedPlanData.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm sm:text-base">
                      R$ {selectedPlanData.price.toFixed(2).replace('.', ',')}
                    </div>
                    <div className={`text-xs sm:text-sm line-through ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      R$ {selectedPlanData.originalPrice.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center font-semibold text-base sm:text-lg">
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>Total</span>
                    <span className="text-green-600">
                      R$ {selectedPlanData.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className={`text-xs sm:text-sm text-center mt-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Pagamento único • Sem mensalidades
                  </div>
                </div>
              </div>

              {/* Features Summary */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className={`font-medium mb-3 text-sm sm:text-base ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Incluído no seu plano:
                </h4>
                <div className="space-y-2">
                  {selectedPlanData.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                  {selectedPlanData.features.length > 4 && (
                    <div className={`text-xs sm:text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      +{selectedPlanData.features.length - 4} mais funcionalidades
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className={`flex items-center justify-center gap-3 sm:gap-4 text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Instantâneo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Suporte</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;