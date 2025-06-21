import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Copy,
  CheckCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  QrCode,
  AlertTriangle,
  Moon,
  Sun
} from 'lucide-react';

interface PaymentPIXProps {
  payment: {
    id: number;
    payment_id: string;
    amount: number;
    formatted_amount: string;
    plan_name: string;
    expires_at: string;
    time_until_expiry: string;
  };
  pix_data: {
    payment_id: string;
    pix_key: string;
    amount: number;
    pix_code: string;
    qr_code_url: string;
  };
  customer: {
    name: string;
    email: string;
  };
  instructions: string[];
}

const PaymentPIX: React.FC<PaymentPIXProps> = ({
  payment,
  pix_data,
  customer,
  instructions
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
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

  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(payment.expires_at).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setIsExpired(true);
        setTimeLeft('Expirado');
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [payment.expires_at]);

  const copyPIXCode = async () => {
    try {
      await navigator.clipboard.writeText(pix_data.pix_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pix_data.pix_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const checkPaymentStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/purchase/pix/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          payment_id: payment.payment_id
        })
      });

      const data = await response.json();
      
      if (data.success && data.status === 'paid') {
        router.visit('/create-card', {
          preserveState: false,
          replace: true
        });
      } else {
        alert('Pagamento ainda não foi confirmado. Tente novamente em alguns minutos.');
      }
    } catch (error) {
      alert('Erro ao verificar pagamento. Tente novamente.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={`min-h-screen py-6 sm:py-8 px-4 transition-all duration-300 ${darkMode ? 'dark' : ''}`}
         style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#ffffff', color: '#1f2937' }}>
      <Head title="Pagamento PIX - DigitalCard" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <button
            onClick={() => router.visit('/purchase')}
            className={`flex items-center gap-2 transition-colors ${
              darkMode 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Voltar</span>
          </button>
          
          <div className="text-center flex-1">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Pagamento PIX
            </h1>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Plano {payment.plan_name} - {payment.formatted_amount}
            </p>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-purple-600"
            />
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Payment Instructions */}
          <div className="space-y-4 sm:space-y-6">
            <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-blue-900/20' : 'bg-blue-100'
                }`}>
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Como Pagar
                  </h2>
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Siga as instruções abaixo
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs sm:text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className={`text-xs sm:text-sm lg:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timer */}
            <Alert className={`${
              isExpired 
                ? darkMode 
                  ? 'border-red-700 bg-red-900/20' 
                  : 'border-red-200 bg-red-50'
                : darkMode 
                  ? 'border-yellow-700 bg-yellow-900/20' 
                  : 'border-yellow-200 bg-yellow-50'
            }`}>
              <Clock className={`h-4 w-4 ${
                isExpired 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
              }`} />
              <AlertDescription className={`text-sm sm:text-base ${
                isExpired 
                  ? darkMode ? 'text-red-300' : 'text-red-800'
                  : darkMode ? 'text-yellow-300' : 'text-yellow-800'
              }`}>
                {isExpired ? (
                  <span className="font-medium">⏰ PIX Expirado! Inicie um novo pagamento.</span>
                ) : (
                  <span>
                    <strong>Tempo restante:</strong> {timeLeft} para concluir o pagamento
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Payment Status Check */}
            <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Já fez o pagamento?
              </h3>
              <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Clique no botão abaixo para verificar se seu pagamento foi confirmado
              </p>
              <Button
                onClick={checkPaymentStatus}
                disabled={isChecking || isExpired}
                className="w-full py-3 sm:py-2"
                variant="outline"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base">Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Verificar Pagamento</span>
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* PIX Code and QR */}
          <div className="space-y-4 sm:space-y-6">
            
            {/* QR Code */}
            <Card className={`p-4 sm:p-6 text-center ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Escaneie o QR Code
              </h2>
              <div className={`inline-block p-3 sm:p-4 rounded-lg border ${
                darkMode ? 'bg-white border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <img 
                  src={pix_data.qr_code_url} 
                  alt="QR Code PIX" 
                  className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gray-100 flex items-center justify-center rounded">
                  <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
              </div>
              <p className={`text-xs sm:text-sm mt-2 sm:mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Abra seu app do banco e escaneie o código
              </p>
            </Card>

            {/* PIX Code */}
            <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Código PIX
              </h2>
              <p className={`text-xs sm:text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ou copie e cole o código no seu app do banco:
              </p>
              
              <div className="relative">
                <div className={`p-3 sm:p-4 rounded-lg border-2 border-dashed mb-3 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <code className={`text-xs sm:text-sm break-all font-mono ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {pix_data.pix_code}
                  </code>
                </div>
                
                <Button
                  onClick={copyPIXCode}
                  disabled={isExpired}
                  className={`w-full py-3 sm:py-2 ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">Código Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      <span className="text-sm sm:text-base">Copiar Código PIX</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Payment Details */}
            <Card className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Detalhes do Pagamento
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Cliente:</span>
                  <span className={`font-medium break-all ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {customer.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Plano:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {payment.plan_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Valor:</span>
                  <span className="font-bold text-green-600">{payment.formatted_amount}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>ID Pagamento:</span>
                  <span className={`font-mono text-xs break-all ml-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {payment.payment_id}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Help Section */}
        <Card className={`mt-6 sm:mt-8 p-4 sm:p-6 ${
          darkMode 
            ? 'bg-blue-900/20 border-blue-700' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold mb-2 text-sm sm:text-base ${
                darkMode ? 'text-blue-300' : 'text-blue-900'
              }`}>
                Precisa de Ajuda?
              </h3>
              <div className={`text-xs sm:text-sm space-y-1 ${
                darkMode ? 'text-blue-200' : 'text-blue-800'
              }`}>
                <p>• O pagamento PIX é processado instantaneamente</p>
                <p>• Após pagar, clique em "Verificar Pagamento"</p>
                <p className="break-words">
                  • Em caso de problemas: <strong>suporte@digitalcard.com.br</strong>
                </p>
                <p>• WhatsApp: <strong>(11) 99999-9999</strong></p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPIX;