import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Copy,
  CheckCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  QrCode,
  AlertTriangle
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <Head title="Pagamento PIX - Capinha Digital" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.visit('/purchase')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Pagamento PIX</h1>
            <p className="text-gray-600">Plano {payment.plan_name} - {payment.formatted_amount}</p>
          </div>
          
          <div className="w-20" /> {/* Spacer */}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Payment Instructions */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Como Pagar</h2>
                  <p className="text-sm text-gray-600">Siga as instruções abaixo</p>
                </div>
              </div>

              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{instruction}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timer */}
            <Alert className={`${isExpired ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <Clock className={`h-4 w-4 ${isExpired ? 'text-red-600' : 'text-yellow-600'}`} />
              <AlertDescription className={isExpired ? 'text-red-800' : 'text-yellow-800'}>
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
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Já fez o pagamento?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Clique no botão abaixo para verificar se seu pagamento foi confirmado
              </p>
              <Button
                onClick={checkPaymentStatus}
                disabled={isChecking || isExpired}
                className="w-full"
                variant="outline"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verificar Pagamento
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* PIX Code and QR */}
          <div className="space-y-6">
            
            {/* QR Code */}
            <Card className="p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">Escaneie o QR Code</h2>
              <div className="inline-block p-4 bg-white rounded-lg border">
                <img 
                  src={pix_data.qr_code_url} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 mx-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Abra seu app do banco e escaneie o código
              </p>
            </Card>

            {/* PIX Code */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Código PIX</h2>
              <p className="text-sm text-gray-600 mb-3">
                Ou copie e cole o código no seu app do banco:
              </p>
              
              <div className="relative">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-3">
                  <code className="text-sm break-all text-gray-800 font-mono">
                    {pix_data.pix_code}
                  </code>
                </div>
                
                <Button
                  onClick={copyPIXCode}
                  disabled={isExpired}
                  className={`w-full ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Código Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Código PIX
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Payment Details */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Detalhes do Pagamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-medium">{payment.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-bold text-green-600">{payment.formatted_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Pagamento:</span>
                  <span className="font-mono text-xs">{payment.payment_id}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Precisa de Ajuda?</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• O pagamento PIX é processado instantaneamente</p>
                <p>• Após pagar, clique em "Verificar Pagamento"</p>
                <p>• Em caso de problemas: <strong>suporte@capinhadigital.com.br</strong></p>
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