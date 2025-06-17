import React, { useState, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Smartphone,
  AlertCircle,
  Loader2,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import BusinessCardDisplay from '@/components/BusinessCardDisplay';
import { Link } from '@inertiajs/react';

interface ClientCardCreatorProps {
  activation_code?: string;
  is_purchase_flow?: boolean;
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

interface ValidatedInputProps {
  name: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  [key: string]: any;
}

// MOVE ValidatedInput OUTSIDE the main component to prevent recreation
const ValidatedInput: React.FC<ValidatedInputProps> = ({ 
  name, 
  label, 
  icon: Icon, 
  required = false, 
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  ...props 
}) => {
  // Only show validation states for IMPORTANT fields
  const isImportantField = ['name', 'color_theme', 'activation_code'].includes(name);

  return (
    <div>
      <Label htmlFor={name} className="text-sm font-medium flex items-center gap-1">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative mt-1">
        <Input 
          id={name} // Add ID for proper label association
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${
            error && isImportantField
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : ''
          }`}
          {...props}
        />
        
        {/* Validation Icon - Only for important fields */}
        {error && isImportantField && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>
      
      {/* Error Message - Only for important fields */}
      {error && isImportantField && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const ClientCardCreator: React.FC<ClientCardCreatorProps> = ({ 
  activation_code, 
  is_purchase_flow = false,
  prefill 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [uploading, setUploading] = useState({ profile: false, logo: false });
  const profileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form state
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
    activation_code: '', // Only for manual entry
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

  // OPTIMIZED handleChange with useCallback to prevent recreation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // OPTIMIZED VALIDATION - Only for most important fields
  const validateField = useCallback((name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório';
        return null;
      case 'color_theme':
        if (!value) return 'Tema de cor é obrigatório';
        return null;
      case 'activation_code':
        // Only validate if purchase flow AND no pre-filled code
        if (is_purchase_flow && !activation_code && !value.trim()) {
          return 'Código de ativação é obrigatório';
        }
        return null;
      default:
        return null;
    }
  }, [is_purchase_flow, activation_code]);

  // OPTIMIZED: Validate current step with improved activation logic
  const validateCurrentStep = useCallback(() => {
    const newErrors: any = {};
    
    switch (currentStep) {
      case 1:
        // Step 1: Only validate NAME
        const nameError = validateField('name', form.name);
        if (nameError) newErrors.name = nameError;
        break;
        
      case 2:
        // Step 2: Only check if at least ONE contact exists
        const hasContact = form.email.trim() || form.phone.trim() || form.whatsapp.trim();
        if (!hasContact) {
          newErrors.contact = 'Pelo menos um meio de contato é obrigatório (email, telefone ou WhatsApp)';
        }
        break;
        
      case 3:
        // Step 3: Only validate COLOR_THEME
        const themeError = validateField('color_theme', form.color_theme);
        if (themeError) newErrors.color_theme = themeError;
        break;
        
      case 4:
        // Step 4: OPTIMIZED activation code validation
        if (is_purchase_flow && !activation_code) {
          // Only validate manual entry if no pre-filled code
          const codeError = validateField('activation_code', form.activation_code);
          if (codeError) newErrors.activation_code = codeError;
        }
        break;
    }
    
    return newErrors;
  }, [currentStep, form, validateField, is_purchase_flow, activation_code]);

  // Navigation with validation
  const nextStep = useCallback(() => {
    setErrors({});
    setGeneralError('');
    
    const stepErrors = validateCurrentStep();
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      
      if (currentStep === 1) {
        setGeneralError('❌ Por favor, preencha o nome para continuar.');
      } else if (currentStep === 2) {
        setGeneralError('❌ Por favor, preencha pelo menos um meio de contato.');
      } else if (currentStep === 3) {
        setGeneralError('❌ Por favor, escolha um tema de cor.');
      } else if (currentStep === 4) {
        setGeneralError('❌ Por favor, digite o código de ativação.');
      }
      
      return;
    }
    
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    setGeneralError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  // OPTIMIZED SUBMIT: Handle activation code properly
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // OPTIMIZED: Final validation
    const finalErrors: any = {};

    // Check NAME
    if (!form.name.trim()) {
      finalErrors.name = 'Nome é obrigatório';
    }

    // Check CONTACT (at least one)
    if (!form.email.trim() && !form.phone.trim() && !form.whatsapp.trim()) {
      finalErrors.contact = 'Pelo menos um meio de contato é obrigatório';
    }

    // Check COLOR_THEME
    if (!form.color_theme) {
      finalErrors.color_theme = 'Tema de cor é obrigatório';
    }

    // OPTIMIZED: Check ACTIVATION_CODE only when needed
    if (is_purchase_flow && !activation_code && !form.activation_code.trim()) {
      finalErrors.activation_code = 'Código de ativação é obrigatório';
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setGeneralError('❌ Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');

    // OPTIMIZED: Prepare submit data with correct activation code
    const finalActivationCode = activation_code || form.activation_code || null;
    
    const submitData = {
      ...form,
      activation_code: is_purchase_flow ? finalActivationCode : null
    };

    router.post('/cards/create-client', submitData, {
      onSuccess: () => {
        setSuccessMessage('✅ Cartão criado com sucesso!');
      },
      onError: (errors) => {
        setErrors(errors);
        if (errors.activation_code) {
          setGeneralError('❌ ' + (Array.isArray(errors.activation_code) ? errors.activation_code[0] : errors.activation_code));
        } else if (errors.general) {
          setGeneralError('❌ ' + (Array.isArray(errors.general) ? errors.general[0] : errors.general));
        } else {
          setGeneralError('❌ Erro ao criar cartão. Tente novamente.');
        }
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
    alert("Cartão criado com sucesso!")
    router.visit("/client/dashboard")
  }, [form, isSubmitting, is_purchase_flow, activation_code]);

  // File upload handling
  const handleFileUpload = useCallback(async (file: File, type: 'profile' | 'logo') => {
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
      } else {
        alert('Erro no upload. Tente novamente.');
      }
    } catch (error) {
      alert('Erro no upload. Tente novamente.');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  const removeImage = useCallback((type: 'profile' | 'logo') => {
    setForm(prev => ({
      ...prev,
      [type === 'profile' ? 'profile_picture' : 'logo']: ''
    }));
  }, []);

  const handleColorThemeChange = useCallback((themeValue: string) => {
    setForm(prev => ({ ...prev, color_theme: themeValue }));
    // Clear color theme error when user selects a theme
    if (errors.color_theme) {
      setErrors(prev => ({ ...prev, color_theme: null }));
    }
  }, [errors.color_theme]);

  // Preview mode
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
            {generalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleSubmit}
              className="w-full gradient-button py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando Cartão...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Finalizar e Ativar Cartão
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-8 px-4">
      <Head title="Criar Meu Cartão Digital" />
      
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
            <p className="text-sm text-muted-foreground">
              {is_purchase_flow ? 'Ative seu cartão premium' : 'Crie seu cartão digital personalizado'}
            </p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Error Messages */}
        {generalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

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

                  <ValidatedInput
                    name="name"
                    label="Nome Completo"
                    icon={User}
                    placeholder="Seu nome completo"
                    required
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                  />

                  <ValidatedInput
                    name="job_title"
                    label="Cargo/Profissão"
                    icon={Building2}
                    placeholder="Ex: Desenvolvedor, Designer, CEO"
                    value={form.job_title}
                    onChange={handleChange}
                    error={errors.job_title}
                  />

                  <ValidatedInput
                    name="company"
                    label="Empresa"
                    icon={Building2}
                    placeholder="Nome da sua empresa"
                    value={form.company}
                    onChange={handleChange}
                    error={errors.company}
                  />

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Descrição (Opcional)
                    </Label>
                    <textarea
                      id="bio"
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

                  {/* Contact Requirement Alert */}
                  {errors.contact && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.contact}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ValidatedInput
                      name="email"
                      label="E-mail"
                      type="email"
                      icon={Mail}
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                    />

                    <ValidatedInput
                      name="phone"
                      label="Telefone"
                      icon={Phone}
                      placeholder="(11) 99999-9999"
                      value={form.phone}
                      onChange={handleChange}
                      error={errors.phone}
                    />
                  </div>

                  <ValidatedInput
                    name="whatsapp"
                    label="WhatsApp"
                    icon={Smartphone}
                    placeholder="(11) 99999-9999"
                    value={form.whatsapp}
                    onChange={handleChange}
                    error={errors.whatsapp}
                  />

                  <ValidatedInput
                    name="website"
                    label="Website"
                    icon={Globe}
                    placeholder="https://seusite.com"
                    value={form.website}
                    onChange={handleChange}
                    error={errors.website}
                  />

                  <ValidatedInput
                    name="location"
                    label="Localização"
                    icon={MapPin}
                    placeholder="São Paulo, SP"
                    value={form.location}
                    onChange={handleChange}
                    error={errors.location}
                  />

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-3">Redes Sociais (Opcional)</h3>
                    <div className="space-y-3">
                      <ValidatedInput
                        name="instagram"
                        label="Instagram"
                        icon={Instagram}
                        placeholder="@seuusuario"
                        value={form.instagram}
                        onChange={handleChange}
                        error={errors.instagram}
                      />

                      <ValidatedInput
                        name="linkedin"
                        label="LinkedIn"
                        icon={Linkedin}
                        placeholder="linkedin.com/in/seuusuario"
                        value={form.linkedin}
                        onChange={handleChange}
                        error={errors.linkedin}
                      />

                      <ValidatedInput
                        name="twitter"
                        label="Twitter"
                        icon={Twitter}
                        placeholder="@seuusuario"
                        value={form.twitter}
                        onChange={handleChange}
                        error={errors.twitter}
                      />
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
                      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative">
                        {form.profile_picture ? (
                          <>
                            <img src={form.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage('profile')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </>
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
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Logo da Empresa (Opcional)
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative">
                        {form.logo ? (
                          <>
                            <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => removeImage('logo')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </>
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
                      </div>
                    </div>
                  </div>

                  {/* Color Theme - IMPORTANT FIELD */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center gap-1">
                      Tema de Cores
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {colorThemes.map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => handleColorThemeChange(theme.value)}
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
                    {errors.color_theme && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.color_theme}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review - OPTIMIZED ACTIVATION CODE LOGIC */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Revisão Final</h2>
                    <p className="text-sm text-muted-foreground">
                      {is_purchase_flow 
                        ? 'Ative seu cartão premium com o código de compra'
                        : 'Verifique suas informações antes de criar o cartão'
                      }
                    </p>
                  </div>

                  {/* SCENARIO 2: Paying Customer WITH pre-filled code */}
                  {is_purchase_flow && activation_code && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium">Código de Ativação Confirmado</span>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Código: <span className="font-mono font-bold">{activation_code}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-3 ml-11">
                        ✅ Seu cartão premium será ativado automaticamente
                      </p>
                    </div>
                  )}

                  {/* SCENARIO 3: Paying Customer WITHOUT code (error case) */}
                  {is_purchase_flow && !activation_code && (
                    <div className="space-y-4">
                      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Para ativar seu cartão premium, digite o código de ativação que você recebeu por email após a compra.
                        </AlertDescription>
                      </Alert>

                      <ValidatedInput
                        name="activation_code"
                        label="Código de Ativação"
                        icon={ShieldCheck}
                        placeholder="Digite seu código de ativação"
                        required={true}
                        value={form.activation_code}
                        onChange={handleChange}
                        error={errors.activation_code}
                      />
                    </div>
                  )}

                  {/* SCENARIO 1: Free users see nothing about activation codes */}

                  {/* Form Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Resumo das suas informações:</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nome:</strong> {form.name || 'Não informado'}</div>
                      {form.job_title && <div><strong>Cargo:</strong> {form.job_title}</div>}
                      {form.company && <div><strong>Empresa:</strong> {form.company}</div>}
                      {form.email && <div><strong>Email:</strong> {form.email}</div>}
                      {form.phone && <div><strong>Telefone:</strong> {form.phone}</div>}
                      {form.whatsapp && <div><strong>WhatsApp:</strong> {form.whatsapp}</div>}
                      <div><strong>Tema:</strong> {colorThemes.find(t => t.value === form.color_theme)?.name}</div>
                      {is_purchase_flow && (
                        <div className="pt-2 border-t">
                          <strong>Tipo:</strong> <span className="text-blue-600 font-medium">Cartão Premium</span>
                        </div>
                      )}
                    </div>
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
              
              {/* Preview benefits for premium users */}
              {is_purchase_flow && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Cartão Premium</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Recursos avançados, analytics e suporte prioritário incluídos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
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
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setIsPreviewMode(true)}
              disabled={isSubmitting}
              className="gradient-button flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {is_purchase_flow ? 'Ativar Cartão Premium' : 'Finalizar Cartão'}
            </Button>
          )}
        </div>

        {/* Help Section */}
        {is_purchase_flow && currentStep === 4 && !activation_code && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Não encontrou seu código de ativação?
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Verifique sua caixa de entrada e spam no email cadastrado</p>
              <p>• O código possui 6 caracteres (ex: ABC123)</p>
              <p>• Entre em contato conosco se não recebeu: suporte@capinhadigital.com.br</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCardCreator;