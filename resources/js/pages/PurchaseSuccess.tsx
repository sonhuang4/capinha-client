import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  CreditCard,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';

interface PurchaseSuccessProps {
  payment: {
    id: number;
    payment_id: string;
    plan_name: string;
    formatted_amount: string;
    payment_method_name: string;
    paid_at: string;
    customer_name: string;
    customer_email: string;
  };
  card_creation_url: string;
  can_create_card: boolean;
}

const PurchaseSuccess: React.FC<PurchaseSuccessProps> = ({ 
  payment, 
  card_creation_url,
  can_create_card 
}) => {
  const [darkMode, setDarkMode] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen py-6 sm:py-8 px-4 transition-all duration-300 ${darkMode ? 'dark' : ''}`}
         style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#ffffff', color: '#1f2937' }}>
      <Head title="Pagamento Realizado com Sucesso! - DigitalCard" />
      
      <div className="max-w-5xl mx-auto">
        {/* Theme Toggle - Fixed position */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20">
          <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-purple-600 scale-75 sm:scale-100"
            />
            {darkMode ? <Moon className="w-3 h-3 sm:w-4 sm:h-4" /> : <Sun className="w-3 h-3 sm:w-4 sm:h-4" />}
          </div>
        </div>

        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-6 ${
            darkMode ? 'bg-green-900/20' : 'bg-green-100'
          }`}>
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          </div>
          
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            🎉 Pagamento Realizado!
          </h1>
          
          <p className={`text-base sm:text-lg mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Parabéns, <strong>{payment.customer_name}</strong>!
          </p>
          
          <p className={`text-sm sm:text-base ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Seu plano foi adquirido com sucesso
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Payment Details */}
          <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h2 className={`text-lg sm:text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Detalhes da Compra
              </h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Plano:
                </span>
                <span className={`font-medium text-sm sm:text-base ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {payment.plan_name}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Valor Pago:
                </span>
                <span className="font-semibold text-green-600 text-sm sm:text-base">
                  {payment.formatted_amount}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Método:
                </span>
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {payment.payment_method_name}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Data:
                </span>
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatDate(payment.paid_at)}
                </span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ID Pagamento:
                </span>
                <span className={`font-mono text-xs sm:text-sm break-all text-right ml-2 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {payment.payment_id}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm sm:text-base ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Status:
                </span>
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Pago
                </span>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h2 className={`text-lg sm:text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Próximos Passos
              </h2>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className={`p-3 sm:p-4 rounded-lg border-2 border-dashed ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <div className="text-center">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2 sm:mb-3" />
                  <p className={`text-xs sm:text-sm mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Seu pagamento foi confirmado!
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-purple-600">
                    Agora você pode criar seu cartão digital
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h3 className={`font-medium text-sm sm:text-base ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Como prosseguir:
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  {[
                    'Clique no botão abaixo para criar seu cartão',
                    'Preencha suas informações profissionais',
                    'Personalize cores e design do seu cartão',
                    'Compartilhe seu cartão digital com o mundo!'
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                
                {can_create_card ? (
                  <Link href={card_creation_url}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-2 sm:py-3 text-sm sm:text-lg font-semibold mt-4">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Criar Meu Cartão Digital
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div className={`p-3 sm:p-4 rounded-lg mt-4 ${
                    darkMode 
                      ? 'bg-yellow-900/20 border border-yellow-800' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className={`text-xs sm:text-sm ${
                      darkMode ? 'text-yellow-300' : 'text-yellow-800'
                    }`}>
                      Aguarde alguns minutos para que seu pagamento seja processado completamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Email Confirmation */}
        <Card className={`p-4 sm:p-6 mt-6 sm:mt-8 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className={`text-base sm:text-lg font-semibold mb-1 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📧 Confirmação por E-mail
              </h3>
              <p className={`text-sm sm:text-base mb-1 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Enviamos uma confirmação da compra para:
              </p>
              <p className={`font-medium text-sm sm:text-base break-words ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {payment.customer_email}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Voltar ao Início
                </Button>
              </Link>
              
              <Link href={card_creation_url}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Important Info */}
        <Card className={`p-4 sm:p-6 mt-6 sm:mt-8 ${
          darkMode 
            ? 'border-blue-700 bg-blue-900/20' 
            : 'border-blue-200 bg-blue-50'
        }`}>
          <div className="text-center">
            <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
              darkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              💡 Informações Importantes
            </h3>
            <div className={`text-xs sm:text-sm space-y-1 ${
              darkMode ? 'text-blue-200' : 'text-blue-700'
            }`}>
              <p>• Você pode personalizar seu cartão a qualquer momento</p>
              <p>• Seu cartão ficará disponível permanentemente</p>
              <p>• Após criar, você receberá um link único para compartilhar</p>
              <p>• Acesse o painel de controle para editar e gerenciar seu cartão</p>
            </div>
          </div>
        </Card>

        {/* Support */}
        <div className="text-center mt-6 sm:mt-8">
          <p className={`text-xs sm:text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Precisa de ajuda? Entre em contato conosco:{' '}
            <a href="mailto:suporte@digitalcard.com.br" className="text-blue-600 hover:underline font-medium">
              suporte@digitalcard.com.br
            </a>
            {' '}ou{' '}
            <a href="https://wa.me/5511999999999" className="text-green-600 hover:underline font-medium">
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess;