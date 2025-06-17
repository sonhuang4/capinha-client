import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  User
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import ThemeToggle from '@/components/ThemeToggle';

interface PurchasePageProps {
  selectedPlan?: string;
}

const PurchasePage: React.FC<PurchasePageProps> = ({ selectedPlan = 'basic' }) => {
  const [currentPlan, setCurrentPlan] = useState(selectedPlan);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '', // CPF
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-8 px-4">
      <Head title="Finalizar Compra - Capinha Digital" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Capinha Digital
            </h1>
            <p className="text-sm text-muted-foreground">Finalize sua compra</p>
          </div>

          <ThemeToggle />
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <CreditCard className="w-4 h-4" />
              <span>1. Pagamento</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>2. Criar Cartão</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Plans Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Escolha seu plano</h2>

              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${currentPlan === plan.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    onClick={() => setCurrentPlan(plan.id)}
                  >
                    {plan.badge && (
                      <Badge className={`absolute -top-2 left-4 ${plan.badgeColor} text-white text-xs`}>
                        {plan.badge}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={currentPlan === plan.id}
                            onChange={() => setCurrentPlan(plan.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              R$ {plan.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              R$ {plan.originalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
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
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Suas informações</h2>

              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
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
                    <Label htmlFor="email" className="text-sm font-medium">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
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
                    <Label htmlFor="document" className="text-sm font-medium">
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
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Forma de pagamento</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'pix'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-green-600 dark:text-green-300" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium">PIX</h4>
                          <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'credit'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium">Cartão de Crédito</h4>
                          <p className="text-sm text-muted-foreground">Até 12x sem juros</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full gradient-button py-3 text-lg font-semibold"
                  >
                    {isProcessing ? (
                      <span>Processando...</span>
                    ) : (
                      <span>
                        Finalizar Compra - R$ {selectedPlanData.price.toFixed(2)}
                      </span>
                    )}
                  </Button>
                  <Button
                    className='w-full gradient-button py-3 text-lg font-semibold mt-[10px]'
                    onClick={() => {
                      router.visit('/create-card')
                    }}>
                    Without plan
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Resumo do pedido</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{selectedPlanData.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedPlanData.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">R$ {selectedPlanData.price.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground line-through">
                      R$ {selectedPlanData.originalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">R$ {selectedPlanData.price.toFixed(2)}</span>
                  </div>

                  <div className="text-sm text-center text-muted-foreground mt-2">
                    Pagamento único • Sem mensalidades
                  </div>
                </div>
              </div>

              {/* Features Summary */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Incluído no seu plano:</h4>
                <div className="space-y-2">
                  {selectedPlanData.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {selectedPlanData.features.length > 4 && (
                    <div className="text-sm text-muted-foreground">
                      +{selectedPlanData.features.length - 4} mais funcionalidades
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>Instantâneo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
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