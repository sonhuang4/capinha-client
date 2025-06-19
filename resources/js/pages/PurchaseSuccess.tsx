import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  CreditCard,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <Head title="Pagamento Realizado com Sucesso! - Capinha Digital" />
      
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            🎉 Pagamento Realizado!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Parabéns, <strong>{payment.customer_name}</strong>!
          </p>
          
          <p className="text-gray-600">
            Seu plano foi adquirido com sucesso
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Payment Details */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Detalhes da Compra</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Plano:</span>
                <span className="font-medium">{payment.plan_name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Pago:</span>
                <span className="font-semibold text-green-600">{payment.formatted_amount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Método:</span>
                <span>{payment.payment_method_name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span>{formatDate(payment.paid_at)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">ID Pagamento:</span>
                <span className="font-mono text-sm">{payment.payment_id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Pago
                </span>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Próximos Passos</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Seu pagamento foi confirmado!
                  </p>
                  <p className="text-lg font-semibold text-purple-600">
                    Agora você pode criar seu cartão digital
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Como prosseguir:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">1</span>
                    <span>Clique no botão abaixo para criar seu cartão</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">2</span>
                    <span>Preencha suas informações profissionais</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">3</span>
                    <span>Personalize cores e design do seu cartão</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">4</span>
                    <span>Compartilhe seu cartão digital com o mundo!</span>
                  </div>
                </div>
                
                {can_create_card ? (
                  <Link href={card_creation_url}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg font-semibold">
                      <User className="w-5 h-5 mr-2" />
                      Criar Meu Cartão Digital
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Aguarde alguns minutos para que seu pagamento seja processado completamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Email Confirmation */}
        <Card className="p-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">📧 Confirmação por E-mail</h3>
              <p className="text-gray-600 mb-1">
                Enviamos uma confirmação da compra para:
              </p>
              <p className="font-medium text-gray-900">
                {payment.customer_email}
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
        <Card className="p-6 mt-8 border-blue-200 bg-blue-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              💡 Informações Importantes
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Você pode personalizar seu cartão a qualquer momento</p>
              <p>• Seu cartão ficará disponível permanentemente</p>
              <p>• Após criar, você receberá um link único para compartilhar</p>
              <p>• Acesse o painel de controle para editar e gerenciar seu cartão</p>
            </div>
          </div>
        </Card>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
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