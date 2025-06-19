import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Copy, 
  ExternalLink,
  QrCode,
  Share2,
  ArrowRight,
  Sparkles,
  Eye,
  Download,
  Printer,
  Smartphone
} from 'lucide-react';

interface CardSuccessProps {
  card: {
    id: number;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    company?: string;
    job_title?: string;
    color_theme: string;
    plan?: string;
  };
  payment?: {
    plan_name: string;
    formatted_amount: string;
    paid_at: string;
  };
  card_url: string;
  short_url: string;
  dashboard_url: string;
  qr_code_url: string; // NEW: URL for QR code content
  qr_download_url?: string; // NEW: Download endpoint for QR
}

const CardSuccess: React.FC<CardSuccessProps> = ({ 
  card, 
  payment, 
  card_url, 
  short_url, 
  dashboard_url,
  qr_code_url,
  qr_download_url
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  const copyToClipboard = async (text: string, isQr = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isQr) {
        setQrCopied(true);
        setTimeout(() => setQrCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (isQr) {
        setQrCopied(true);
        setTimeout(() => setQrCopied(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const shareOnWhatsApp = () => {
    const message = `Olá! Conheça meu cartão digital: ${short_url}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getThemeGradient = (theme: string) => {
    const themes: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-emerald-500 to-green-600',
      purple: 'from-purple-500 to-violet-600',
      pink: 'from-pink-500 to-rose-600',
      orange: 'from-orange-500 to-amber-600',
      dark: 'from-gray-800 to-slate-800',
    };
    return themes[theme] || themes.blue;
  };

  // Generate QR Code as data URL using a QR library or API
  const generateQRCodeDataUrl = (url: string) => {
    // Using Google Charts API for QR generation (free, reliable)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const downloadQRCode = async () => {
    if (qr_download_url) {
      // Use your backend endpoint
      window.open(qr_download_url, '_blank');
    } else {
      // Fallback: download from generated URL
      const qrImageUrl = generateQRCodeDataUrl(qr_code_url);
      try {
        const response = await fetch(qrImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${card.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <Head title={`Cartão Criado - ${card.name}`} />
      
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            🎉 Cartão Criado com Sucesso!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Parabéns, <strong>{card.name}</strong>!
          </p>
          
          <p className="text-gray-600">
            Seu cartão digital está pronto para ser compartilhado
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Card Preview */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Prévia do Seu Cartão
              </h2>
              
              {/* Mini Card Preview */}
              <div className="max-w-sm mx-auto">
                <div className={`bg-gradient-to-br ${getThemeGradient(card.color_theme)} rounded-xl p-6 text-white shadow-xl`}>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">{card.name}</h3>
                    {card.job_title && (
                      <p className="text-white/90 text-sm mb-1">{card.job_title}</p>
                    )}
                    {card.company && (
                      <p className="text-white/80 text-xs mb-3">{card.company}</p>
                    )}
                    
                    <div className="space-y-1 text-sm">
                      {card.email && (
                        <div className="text-white/90">📧 {card.email}</div>
                      )}
                      {card.phone && (
                        <div className="text-white/90">📱 {card.phone}</div>
                      )}
                      {card.whatsapp && (
                        <div className="text-white/90">💬 {card.whatsapp}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Button
                  onClick={() => window.open(card_url, '_blank')}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Cartão Completo
                </Button>
              </div>
            </Card>

            {/* Payment Info */}
            {payment && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">💳 Detalhes da Compra</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Plano:</span>
                    <span className="font-medium">{payment.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-semibold">{payment.formatted_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-700 font-medium">✅ Pago</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* QR Code Section - NEW! */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                Seu QR Code
              </h2>
              
              <div className="text-center space-y-4">
                {/* QR Code Display */}
                <div className="inline-block p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                  <img
                    src={generateQRCodeDataUrl(qr_code_url)}
                    alt={`QR Code for ${card.name}`}
                    className="w-40 h-40 mx-auto"
                  />
                </div>
                
                {/* QR URL Display */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Link do QR Code:</p>
                  <code className="text-sm font-mono text-purple-600 break-all">
                    {qr_code_url}
                  </code>
                </div>
                
                {/* QR Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => copyToClipboard(qr_code_url, true)}
                    size="sm"
                    variant="outline"
                    className={qrCopied ? 'text-green-600 border-green-600' : ''}
                  >
                    {qrCopied ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={downloadQRCode}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Baixar
                  </Button>
                </div>
                
                {/* QR Usage Tips */}
                <div className="text-left bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">
                    💡 Como usar o QR Code:
                  </h4>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Imprima em cartões de visita</li>
                    <li>• Cole em capinhas de celular</li>
                    <li>• Use em materiais promocionais</li>
                    <li>• Compartilhe em redes sociais</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Card Link & Actions */}
          <div className="space-y-6">
            
            {/* Card Link */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-600" />
                Link do Seu Cartão
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Seu link único:</p>
                    <code className="text-lg font-mono text-blue-600 break-all">
                      {short_url}
                    </code>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => copyToClipboard(short_url)}
                    className={`${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={shareOnWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    💬 WhatsApp
                  </Button>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">🚀 Próximos Passos</h3>
              
              <div className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">1</span>
                    <span>Baixe e imprima seu QR Code</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">2</span>
                    <span>Compartilhe o link em redes sociais</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">3</span>
                    <span>Cole QR em materiais físicos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">4</span>
                    <span>Edite quando necessário no painel</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 mt-6">
                  <Link href={dashboard_url}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ir para Painel de Controle
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Important Info */}
        <Card className="p-6 mt-8 border-green-200 bg-green-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✨ Informações Importantes
            </h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Seu cartão está ativo e pode ser acessado imediatamente</p>
              <p>• O link e QR Code nunca expiram e funcionam em qualquer dispositivo</p>
              <p>• Você pode editar as informações a qualquer momento</p>
              <p>• O QR Code pode ser impresso e usado offline</p>
              <p>• Mesma URL funciona para NFC e QR Code: <code className="bg-white px-1 rounded">{short_url}</code></p>
            </div>
          </div>
        </Card>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Precisa de ajuda ou tem sugestões?{' '}
            <a href="mailto:suporte@capinhadigital.com.br" className="text-blue-600 hover:underline font-medium">
              Entre em contato conosco
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardSuccess;