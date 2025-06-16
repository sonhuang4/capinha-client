import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Instagram, 
  Linkedin, 
  Twitter,
  Building2,
  MapPin,
  Upload,
  Palette,
  Eye,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Smartphone
} from 'lucide-react';
import BusinessCardDisplay from '@/components/BusinessCardDisplay';
import { Link } from '@inertiajs/react';

interface ClientCardCreatorProps {
  activation_code?: string;
  prefill?: {
    name?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    website?: string;
    profile_picture?: string;
    logo?: string;
    color_theme?: string;
    request_id?: string;
  };
}

const ClientCardCreator: React.FC<ClientCardCreatorProps> = ({ activation_code, prefill }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [uploading, setUploading] = useState({ profile: false, logo: false });
  const profileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: prefill?.name || '',
    job_title: '',
    company: '',
    email: prefill?.email || '',
    phone: '',
    whatsapp: prefill?.whatsapp || '',
    website: prefill?.website || '',
    location: '',
    bio: '',
    instagram: prefill?.instagram || '',
    linkedin: '',
    twitter: '',
    facebook: '',
    profile_picture: prefill?.profile_picture || '',
    logo: prefill?.logo || '',
    color_theme: prefill?.color_theme || 'blue',
    activation_code: activation_code || '',
    request_id: prefill?.request_id || null,
  });

  const colorThemes = [
    { value: 'blue', name: 'Azul Profissional', gradient: 'from-blue-500 to-blue-600' },
    { value: 'green', name: 'Verde Natureza', gradient: 'from-emerald-500 to-green-600' },
    { value: 'purple', name: 'Roxo Criativo', gradient: 'from-purple-500 to-violet-600' },
    { value: 'pink', name: 'Rosa Moderno', gradient: 'from-pink-500 to-rose-600' },
    { value: 'orange', name: 'Laranja Energia', gradient: 'from-orange-500 to-amber-600' },
    { value: 'dark', name: 'Escuro Elegante', gradient: 'from-gray-800 to-slate-800' },
  ];

  const steps = [
    { number: 1, title: 'Informações Básicas', icon: User },
    { number: 2, title: 'Contato & Social', icon: Phone },
    { number: 3, title: 'Visual & Estilo', icon: Palette },
    { number: 4, title: 'Revisão Final', icon: Eye },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'logo') => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({
          ...prev,
          [type === 'profile' ? 'profile_picture' : 'logo']: data.url
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/cards/create-client', form, {
      onSuccess: () => {
        // Handle success (redirect to success page)
      },
      onError: (errors) => {
        console.error('Form errors:', errors);
      }
    });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return form.name.trim() !== '';
      case 2:
        return form.email.trim() !== '' || form.phone.trim() !== '' || form.whatsapp.trim() !== '';
      default:
        return true;
    }
  };

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-8 px-4">
        <Head title="Prévia do Cartão" />
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à Edição
            </Button>
            <h1 className="text-xl font-bold">Prévia do Cartão</h1>
          </div>
          
          <BusinessCardDisplay card={form} preview={true} />
          
          <div className="mt-6 space-y-3">
            <Button 
              onClick={handleSubmit}
              className="w-full gradient-button py-3"
              disabled={!form.activation_code}
            >
              <Check className="w-5 h-5 mr-2" />
              Finalizar e Ativar Cartão
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Ao finalizar, seu cartão será ativado e estará disponível para compartilhamento
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-8 px-4">
      <Head title="Criar Meu Cartão Digital" />
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Capinha Digital
            </h1>
            <p className="text-sm text-muted-foreground">Crie seu cartão digital personalizado</p>
          </div>
          
          <div className="w-20" /> {/* Spacer for center alignment */}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  step.number === currentStep 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                    : step.number < currentStep 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${step.number < currentStep ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Informações Básicas</h2>
                    <p className="text-sm text-muted-foreground">
                      Vamos começar com suas informações principais
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome Completo *
                    </Label>
                    <Input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className="mt-1"
                      required 
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_title" className="text-sm font-medium">
                      Cargo/Profissão
                    </Label>
                    <Input 
                      name="job_title" 
                      value={form.job_title} 
                      onChange={handleChange}
                      placeholder="Ex: Desenvolvedor, Designer, CEO"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-sm font-medium">
                      Empresa
                    </Label>
                    <Input 
                      name="company" 
                      value={form.company} 
                      onChange={handleChange}
                      placeholder="Nome da sua empresa"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Descrição (Opcional)
                    </Label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Uma breve descrição sobre você ou seu trabalho..."
                      className="w-full mt-1 p-3 border border-input rounded-md bg-background resize-none"
                      rows={3}
                      maxLength={150}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {form.bio.length}/150 caracteres
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Social */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Contato & Redes Sociais</h2>
                    <p className="text-sm text-muted-foreground">
                      Como as pessoas podem entrar em contato com você
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        <Mail className="w-4 h-4 inline mr-1" />
                        E-mail
                      </Label>
                      <Input 
                        name="email" 
                        type="email"
                        value={form.email} 
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefone
                      </Label>
                      <Input 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp" className="text-sm font-medium">
                      <Smartphone className="w-4 h-4 inline mr-1" />
                      WhatsApp
                    </Label>
                    <Input 
                      name="whatsapp" 
                      value={form.whatsapp} 
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-sm font-medium">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </Label>
                    <Input 
                      name="website" 
                      value={form.website} 
                      onChange={handleChange}
                      placeholder="https://seusite.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Localização
                    </Label>
                    <Input 
                      name="location" 
                      value={form.location} 
                      onChange={handleChange}
                      placeholder="São Paulo, SP"
                      className="mt-1"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-3">Redes Sociais (Opcional)</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="instagram" className="text-sm font-medium">
                          <Instagram className="w-4 h-4 inline mr-1" />
                          Instagram
                        </Label>
                        <Input 
                          name="instagram" 
                          value={form.instagram} 
                          onChange={handleChange}
                          placeholder="@seuusuario"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="linkedin" className="text-sm font-medium">
                          <Linkedin className="w-4 h-4 inline mr-1" />
                          LinkedIn
                        </Label>
                        <Input 
                          name="linkedin" 
                          value={form.linkedin} 
                          onChange={handleChange}
                          placeholder="linkedin.com/in/seuusuario"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter" className="text-sm font-medium">
                          <Twitter className="w-4 h-4 inline mr-1" />
                          Twitter
                        </Label>
                        <Input 
                          name="twitter" 
                          value={form.twitter} 
                          onChange={handleChange}
                          placeholder="@seuusuario"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Visual & Style */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Visual & Estilo</h2>
                    <p className="text-sm text-muted-foreground">
                      Personalize a aparência do seu cartão
                    </p>
                  </div>

                  {/* Profile Picture Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Foto de Perfil
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                        {form.profile_picture ? (
                          <img src={form.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={profileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profile')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => profileInputRef.current?.click()}
                          disabled={uploading.profile}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading.profile ? 'Enviando...' : 'Enviar Foto'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG ou GIF (máx. 2MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Logo da Empresa (Opcional)
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                        {form.logo ? (
                          <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploading.logo}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading.logo ? 'Enviando...' : 'Enviar Logo'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          PNG ou SVG recomendado
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Theme */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Tema de Cores
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {colorThemes.map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, color_theme: theme.value }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            form.color_theme === theme.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-full h-8 rounded-md bg-gradient-to-r ${theme.gradient} mb-2`} />
                          <p className="text-xs font-medium">{theme.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Revisão Final</h2>
                    <p className="text-sm text-muted-foreground">
                      Verifique suas informações antes de ativar o cartão
                    </p>
                  </div>

                  {activation_code && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Código de Ativação Válido</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Código: {activation_code}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="activation_code" className="text-sm font-medium">
                        Código de Ativação *
                      </Label>
                      <Input 
                        name="activation_code" 
                        value={form.activation_code} 
                        onChange={handleChange}
                        placeholder="Digite seu código de ativação"
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        O código foi enviado para seu e-mail após a compra
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      O que acontece depois?
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Seu cartão será ativado imediatamente</li>
                      <li>• Você receberá um link único para compartilhar</li>
                      <li>• Poderá editar suas informações a qualquer momento</li>
                      <li>• Terá acesso às estatísticas de visualização</li>
                    </ul>
                  </div>
                </div>
              )}
            </form>
          </Card>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prévia do Cartão</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(true)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Visualizar Completo
              </Button>
            </div>
            
            <div className="sticky top-8">
              <BusinessCardDisplay card={form} preview={true} />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Passo {currentStep} de {steps.length}
          </div>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setIsPreviewMode(true)}
              disabled={!form.activation_code}
              className="gradient-button flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Finalizar Cartão
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCardCreator;