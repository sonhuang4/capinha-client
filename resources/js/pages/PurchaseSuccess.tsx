import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  CreditCard,
  User,
  ArrowRight,
  Mail,
  Copy,
  ExternalLink,
  Smartphone
} from 'lucide-react';

interface ActivationCode {
  code: string;
  plan: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  payment_method: string;
  sold_at: string;
}

interface PurchaseSuccessProps {
  activation_code: ActivationCode;
  card_creation_url: string;
}

const PurchaseSuccess: React.FC<PurchaseSuccessProps> = ({ 
  activation_code, 
  card_creation_url 
}) => {
  const planNames = {
    basic: 'Básico',
    premium: 'Premium',
    business: 'Empresarial'
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Código copiado para a área de transferência!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Código copiado!');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20 py-8 px-4">
      <Head title="Compra Realizada com Sucesso! - Capinha Digital" />
      
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            🎉 Pagamento Realizado!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Parabéns, <strong>{activation_code.customer_name}</strong>!
          </p>
          
          <p className="text-gray-600 dark:text-gray-300">
            Seu cartão digital foi adquirido com sucesso
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Purchase Details */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Detalhes da Compra</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plano:</span>
                <span className="font-medium">{planNames[activation_code.plan as keyof typeof planNames]}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valor Pago:</span>
                <span className="font-semibold text-green-600">{formatAmount(activation_code.amount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Método:</span>
                <span className="capitalize">{activation_code.payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Data:</span>
                <span>{formatDate(activation_code.sold_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Pago
                </span>
              </div>
            </div>
          </Card>

          {/* Activation Code */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Código de Ativação</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-700">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Seu código de ativação:
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider bg-white dark:bg-gray-800 px-4 py-2 rounded border">
                      {activation_code.code}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(activation_code.code)}
                      className="p-2"
                      title="Copiar código"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ⚠️ Guarde este código com segurança
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Próximos Passos:</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">1</span>
                    <span>Clique no botão abaixo para personalizar seu cartão</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">2</span>
                    <span>Digite o código de ativação quando solicitado</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">3</span>
                    <span>Preencha suas informações e personalize o design</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">4</span>
                    <span>Compartilhe seu cartão digital com o mundo!</span>
                  </div>
                </div>
                
                <Link href={card_creation_url}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg font-semibold">
                    <User className="w-5 h-5 mr-2" />
                    Criar Meu Cartão Digital
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Email Confirmation */}
        <Card className="p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Confirmação por E-mail</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Enviamos uma confirmação da compra e o código de ativação para:
              </p>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {activation_code.customer_email}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline">
                  Voltar ao Início
                </Button>
              </Link>
              
              <Link href={card_creation_url}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Important Info */}
        <Card className="p-6 mt-8 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
              📋 Informações Importantes
            </h3>
            <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <p>• Seu código de ativação é válido por tempo ilimitado</p>
              <p>• Você pode personalizar seu cartão a qualquer momento</p>
              <p>• Não compartilhe seu código de ativação com terceiros</p>
              <p>• Após criar o cartão, você receberá um link único para compartilhar</p>
            </div>
          </div>
        </Card>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Precisa de ajuda? Entre em contato conosco:{' '}
            <a href="mailto:suporte@capinhadigital.com.br" className="text-blue-600 hover:underline font-medium">
              suporte@capinhadigital.com.br
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