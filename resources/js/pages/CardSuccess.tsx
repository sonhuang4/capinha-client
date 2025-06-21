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
  Smartphone,
  Star,
  Zap,
  Globe,
  Heart
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
  qr_code_url: string;
  qr_download_url?: string;
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

  const generateQRCodeDataUrl = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const downloadQRCode = async () => {
    if (qr_download_url) {
      window.open(qr_download_url, '_blank');
    } else {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-[#020818] dark:to-slate-900 transition-colors duration-300">
      <Head title={`Cartão Criado - ${card.name}`} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* SUCCESS HEADER */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full mb-4 sm:mb-6 shadow-lg">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-[#ae9efd] mb-3 sm:mb-4">
            <span className="inline-block animate-bounce mr-2">🎉</span>
            Cartão Criado com Sucesso!
          </h1>
          
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 mb-2">
            Parabéns, <strong className="text-blue-600 dark:text-[#ae9efd]">{card.name}</strong>!
          </p>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Seu cartão digital está pronto para ser compartilhado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* CARD PREVIEW SECTION */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-[#ae9efd]">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="hidden sm:inline">Prévia do Seu Cartão</span>
                  <span className="sm:hidden">Seu Cartão</span>
                </h2>
                
                {/* MINI CARD PREVIEW */}
                <div className="max-w-sm mx-auto">
                  <div className={`bg-gradient-to-br ${getThemeGradient(card.color_theme)} rounded-xl p-4 sm:p-6 text-white shadow-xl transform hover:scale-105 transition-transform duration-200`}>
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl font-bold mb-1">{card.name}</h3>
                      {card.job_title && (
                        <p className="text-white/90 text-sm mb-1">{card.job_title}</p>
                      )}
                      {card.company && (
                        <p className="text-white/80 text-xs mb-3">{card.company}</p>
                      )}
                      
                      <div className="space-y-1 text-xs sm:text-sm">
                        {card.email && (
                          <div className="text-white/90 flex items-center justify-center gap-1">
                            <span>📧</span>
                            <span className="truncate">{card.email}</span>
                          </div>
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
                    className="flex items-center gap-2 mx-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Ver Cartão Completo</span>
                    <span className="sm:hidden">Ver Completo</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* PAYMENT INFO */}
            {payment && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700/30 shadow-lg">
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Detalhes da Compra
                  </h3>
                  <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex justify-between items-center">
                      <span>Plano:</span>
                      <span className="font-medium bg-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded">{payment.plan_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Valor:</span>
                      <span className="font-bold text-base text-green-600 dark:text-green-400">{payment.formatted_amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Pago
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* QR CODE SECTION */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-[#ae9efd]">
                  <QrCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="hidden sm:inline">Seu QR Code</span>
                  <span className="sm:hidden">QR Code</span>
                </h2>
                
                <div className="text-center space-y-4">
                  {/* QR CODE DISPLAY */}
                  <div className="inline-block p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-sm">
                    <img
                      src={generateQRCodeDataUrl(qr_code_url)}
                      alt={`QR Code para ${card.name}`}
                      className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-lg"
                    />
                  </div>
                  
                  {/* QR URL DISPLAY */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Link do QR Code:</p>
                    <code className="text-xs sm:text-sm font-mono text-purple-600 dark:text-purple-400 break-all">
                      {qr_code_url}
                    </code>
                  </div>
                  
                  {/* QR ACTIONS */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      onClick={() => copyToClipboard(qr_code_url, true)}
                      size="sm"
                      variant="outline"
                      className={`transition-all duration-200 ${
                        qrCopied 
                          ? 'text-green-600 border-green-600 bg-green-50 dark:text-green-400 dark:border-green-400 dark:bg-green-900/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {qrCopied ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span className="hidden xs:inline">Copiado!</span>
                          <span className="xs:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          <span className="hidden xs:inline">Copiar</span>
                          <span className="xs:hidden">📋</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={downloadQRCode}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      <span className="hidden xs:inline">Baixar</span>
                      <span className="xs:hidden">⬇️</span>
                    </Button>
                  </div>
                  
                  {/* QR USAGE TIPS */}
                  <div className="text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30 rounded-lg p-3 sm:p-4 mt-4">
                    <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Como usar o QR Code:
                    </h4>
                    <ul className="text-xs sm:text-sm text-purple-700 dark:text-purple-200 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                        Imprima em cartões de visita
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                        Cole em capinhas de celular
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                        Use em materiais promocionais
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                        Compartilhe em redes sociais
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* SHARING & ACTIONS SECTION */}
          <div className="space-y-6">
            
            {/* CARD LINK */}
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-[#ae9efd]">
                  <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="hidden sm:inline">Link do Seu Cartão</span>
                  <span className="sm:hidden">Link</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">Seu link único:</p>
                      <code className="text-sm sm:text-base font-mono text-blue-600 dark:text-blue-400 break-all block">
                        {short_url}
                      </code>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => copyToClipboard(short_url)}
                      className={`transition-all duration-200 ${
                        copied 
                          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' 
                          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                      } text-white`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="hidden xs:inline">Copiado!</span>
                          <span className="xs:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          <span className="hidden xs:inline">Copiar Link</span>
                          <span className="xs:hidden">📋</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={shareOnWhatsApp}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                    >
                      <span className="mr-2">💬</span>
                      <span className="hidden xs:inline">WhatsApp</span>
                      <span className="xs:hidden">WA</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* NEXT STEPS */}
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="p-4 sm:p-6">
                <h3 className="font-semibold mb-4 text-slate-900 dark:text-[#ae9efd] flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Próximos Passos
                </h3>
                
                <div className="space-y-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">1</span>
                      <span>Baixe e imprima seu QR Code</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">2</span>
                      <span>Compartilhe o link em redes sociais</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">3</span>
                      <span>Cole QR em materiais físicos</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center justify-center font-medium flex-shrink-0">4</span>
                      <span>Edite quando necessário no painel</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href={dashboard_url}>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-700 dark:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Ir para Painel de Controle</span>
                        <span className="sm:hidden">Painel</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* IMPORTANT INFO */}
        <Card className="mt-8 border-green-200 dark:border-green-700/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-300 mb-3 sm:mb-4 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Informações Importantes
              </h3>
              <div className="text-xs sm:text-sm text-green-700 dark:text-green-200 space-y-2 max-w-4xl mx-auto">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  Seu cartão está ativo e pode ser acessado imediatamente
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  O link e QR Code nunca expiram e funcionam em qualquer dispositivo
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  Você pode editar as informações a qualquer momento
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  O QR Code pode ser impresso e usado offline
                </p>
                <p className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                  <span>Mesma URL funciona para NFC e QR Code:</span>
                  <code className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs break-all">
                    {short_url}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* SUPPORT SECTION */}
        <div className="text-center mt-8">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Precisa de ajuda ou tem sugestões?{' '}
            <a 
              href="mailto:suporte@capinhadigital.com.br" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
            >
              Entre em contato conosco
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardSuccess;