import React, { useState, useRef, useCallback, useEffect } from 'react';
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

// Basic UI Components
const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  />
);

const Label = ({ className = '', children, ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
);

const Button = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false,
  children, 
  ...props 
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ className = '', children, ...props }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const Alert = ({ variant = 'default', className = '', children, ...props }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800"
  };
  
  return (
    <div className={`p-4 rounded-md border ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertDescription = ({ className = '', children, ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

// Simple Business Card Display Component
const BusinessCardDisplay = ({ card, preview = false }) => {
  const colorThemes = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-green-600',
    purple: 'from-purple-500 to-violet-600',
    pink: 'from-pink-500 to-rose-600',
    orange: 'from-orange-500 to-amber-600',
    dark: 'from-gray-800 to-slate-800'
  };

  const gradientClass = colorThemes[card.color_theme] || colorThemes.blue;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className={`bg-gradient-to-br ${gradientClass} rounded-xl p-6 text-white shadow-xl`}>
        <div className="flex items-start gap-4">
          {card.profile_picture ? (
            <img 
              src={card.profile_picture} 
              alt={card.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8 text-white/80" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{card.name || 'Seu Nome'}</h3>
            {card.job_title && (
              <p className="text-white/90 text-sm">{card.job_title}</p>
            )}
            {card.company && (
              <p className="text-white/80 text-xs">{card.company}</p>
            )}
          </div>
          
          {card.logo && (
            <img 
              src={card.logo} 
              alt="Logo" 
              className="w-12 h-12 rounded object-contain bg-white/10 p-1"
            />
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          {card.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              <span className="truncate">{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <span>{card.phone}</span>
            </div>
          )}
          {card.whatsapp && (
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="w-4 h-4" />
              <span>{card.whatsapp}</span>
            </div>
          )}
          {card.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4" />
              <span className="truncate">{card.website}</span>
            </div>
          )}
        </div>
        
        {(card.instagram || card.linkedin || card.twitter) && (
          <div className="mt-3 flex gap-3">
            {card.instagram && <Instagram className="w-4 h-4" />}
            {card.linkedin && <Linkedin className="w-4 h-4" />}
            {card.twitter && <Twitter className="w-4 h-4" />}
          </div>
        )}
      </div>
    </div>
  );
};

// Navigation helper functions
const navigateToRoute = (path) => {
  window.location.href = path;
};

const submitForm = async (url, data, method = 'POST') => {
  try {
    // Get CSRF token
    let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (!csrfToken) {
      const csrfResponse = await fetch('/csrf-token');
      const csrfData = await csrfResponse.json();
      csrfToken = csrfData.token;
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, errors: errorData.errors || {} };
    }
  } catch (error) {
    return { success: false, errors: { general: error.message } };
  }
};

// ValidatedInput component
const ValidatedInput = ({
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
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${error && isImportantField
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : ''
            }`}
          {...props}
        />

        {error && isImportantField && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>

      {error && isImportantField && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const ClientCardCreator = ({
  activation_code,
  is_purchase_flow = false,
  edit_mode = false,
  card_id,
  prefill
}) => {
  // Debug logging
  console.log('=== COMPONENT PROPS DEBUG ===');
  console.log('edit_mode:', edit_mode);
  console.log('card_id:', card_id);
  console.log('prefill data:', prefill);
  console.log('prefill keys:', prefill ? Object.keys(prefill) : 'null');
  console.log('=============================');

  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [uploading, setUploading] = useState({ profile: false, logo: false });
  const profileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Form state with initial prefill
  const [form, setForm] = useState({
    name: prefill?.name || '',
    job_title: prefill?.job_title || '',
    company: prefill?.company || '',
    email: prefill?.email || '',
    phone: prefill?.phone || '',
    whatsapp: prefill?.whatsapp || '',
    website: prefill?.website || '',
    location: prefill?.location || '',
    bio: prefill?.bio || '',
    instagram: prefill?.instagram || '',
    linkedin: prefill?.linkedin || '',
    twitter: prefill?.twitter || '',
    facebook: prefill?.facebook || '',
    profile_picture: prefill?.profile_picture || '',
    logo: prefill?.logo || '',
    color_theme: prefill?.color_theme || 'blue',
    activation_code: '',
    request_id: prefill?.request_id || null,
  });

  // CRITICAL: Update form when prefill data changes (for edit mode)
  useEffect(() => {
    if (prefill && edit_mode) {
      console.log('Updating form with prefill data:', prefill);
      setForm({
        name: prefill.name || '',
        job_title: prefill.job_title || '',
        company: prefill.company || '',
        email: prefill.email || '',
        phone: prefill.phone || '',
        whatsapp: prefill.whatsapp || '',
        website: prefill.website || '',
        location: prefill.location || '',
        bio: prefill.bio || '',
        instagram: prefill.instagram || '',
        linkedin: prefill.linkedin || '',
        twitter: prefill.twitter || '',
        facebook: prefill.facebook || '',
        profile_picture: prefill.profile_picture || '',
        logo: prefill.logo || '',
        color_theme: prefill.color_theme || 'blue',
        activation_code: '',
        request_id: prefill.request_id || null,
      });
    }
  }, [prefill, edit_mode]);

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

  const showAlert = (message, type = 'info') => {
    if (type === 'success') {
      console.log(`✅ ${message}`);
    } else if (type === 'error') {
      console.error(`❌ ${message}`);
    } else if (type === 'warning') {
      console.warn(`⚠️ ${message}`);
    } else {
      console.info(`ℹ️ ${message}`);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório';
        return null;
      case 'color_theme':
        if (!value) return 'Tema de cor é obrigatório';
        return null;
      case 'activation_code':
        if (!edit_mode && is_purchase_flow && !activation_code && !value.trim()) {
          return 'Código de ativação é obrigatório';
        }
        return null;
      default:
        return null;
    }
  }, [is_purchase_flow, activation_code, edit_mode]);

  const validateCurrentStep = useCallback(() => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        const nameError = validateField('name', form.name);
        if (nameError) newErrors.name = nameError;
        break;

      case 2:
        const hasContact = form.email.trim() || form.phone.trim() || form.whatsapp.trim();
        if (!hasContact) {
          newErrors.contact = 'Pelo menos um meio de contato é obrigatório (email, telefone ou WhatsApp)';
        }
        break;

      case 3:
        const themeError = validateField('color_theme', form.color_theme);
        if (themeError) newErrors.color_theme = themeError;
        break;

      case 4:
        if (!edit_mode && is_purchase_flow && !activation_code) {
          const codeError = validateField('activation_code', form.activation_code);
          if (codeError) newErrors.activation_code = codeError;
        }
        break;
    }

    return newErrors;
  }, [currentStep, form, validateField, is_purchase_flow, activation_code, edit_mode]);

  const nextStep = useCallback(() => {
    setErrors({});
    setGeneralError('');

    const stepErrors = validateCurrentStep();

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);

      if (currentStep === 1) {
        const msg = '❌ Por favor, preencha o nome para continuar.';
        setGeneralError(msg);
        showAlert(msg, 'warning');
      } else if (currentStep === 2) {
        const msg = '❌ Por favor, preencha pelo menos um meio de contato.';
        setGeneralError(msg);
        showAlert(msg, 'warning');
      } else if (currentStep === 3) {
        const msg = '❌ Por favor, escolha um tema de cor.';
        setGeneralError(msg);
        showAlert(msg, 'warning');
      } else if (currentStep === 4) {
        const msg = '❌ Por favor, digite o código de ativação.';
        setGeneralError(msg);
        showAlert(msg, 'warning');
      }

      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      showAlert(`✅ Passo ${currentStep + 1} completado!`, 'success');
    }
  }, [currentStep, validateCurrentStep, showAlert]);

  const prevStep = useCallback(() => {
    setGeneralError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const finalErrors = {};

    if (!form.name.trim()) {
      finalErrors.name = 'Nome é obrigatório';
    }

    if (!form.email.trim() && !form.phone.trim() && !form.whatsapp.trim()) {
      finalErrors.contact = 'Pelo menos um meio de contato é obrigatório';
    }

    if (!form.color_theme) {
      finalErrors.color_theme = 'Tema de cor é obrigatório';
    }

    if (!edit_mode && is_purchase_flow && !activation_code && !form.activation_code.trim()) {
      finalErrors.activation_code = 'Código de ativação é obrigatório';
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setGeneralError('❌ Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');

    const submitData = {
      ...form,
      activation_code: (!edit_mode && is_purchase_flow) ? (activation_code || form.activation_code || null) : undefined
    };

    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    console.log('Submitting:', edit_mode ? 'EDIT' : 'CREATE');
    console.log('Card ID:', card_id);
    console.log('Data:', submitData);

    if (edit_mode && card_id) {
      const result = await submitForm(`/client/cards/${card_id}`, submitData, 'PUT');
      
      if (result.success) {
        showAlert('✅ Cartão atualizado com sucesso!', 'success');
        navigateToRoute('/client/dashboard');
      } else {
        console.error('Update errors:', result.errors);
        setErrors(result.errors);

        let errorMessage = '❌ Erro ao atualizar cartão.';
        if (result.errors.contact) {
          errorMessage = '❌ ' + (Array.isArray(result.errors.contact) ? result.errors.contact[0] : result.errors.contact);
        } else if (result.errors.general) {
          errorMessage = '❌ ' + (Array.isArray(result.errors.general) ? result.errors.general[0] : result.errors.general);
        }

        setGeneralError(errorMessage);
      }
    } else {
      const result = await submitForm('/cards/create-client', submitData, 'POST');
      
      if (result.success) {
        showAlert('✅ Cartão criado com sucesso!', 'success');
        setSuccessMessage('✅ Cartão criado com sucesso!');
        navigateToRoute('/client/dashboard');
      } else {
        console.error('Create errors:', result.errors);
        setErrors(result.errors);

        let errorMessage = '❌ Erro ao criar cartão.';
        if (result.errors.activation_code) {
          errorMessage = '❌ ' + (Array.isArray(result.errors.activation_code) ? result.errors.activation_code[0] : result.errors.activation_code);
        } else if (result.errors.general) {
          errorMessage = '❌ ' + (Array.isArray(result.errors.general) ? result.errors.general[0] : result.errors.general);
        } else if (result.errors.contact) {
          errorMessage = '❌ ' + (Array.isArray(result.errors.contact) ? result.errors.contact[0] : result.errors.contact);
        }

        setGeneralError(errorMessage);
      }
    }
    
    setIsSubmitting(false);
  }, [form, isSubmitting, is_purchase_flow, activation_code, edit_mode, card_id]);

  const handleFileUpload = useCallback(async (file, type) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    showAlert('📤 Enviando imagem...', 'info');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      if (!csrfToken) {
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
        if (csrfCookie) {
          csrfToken = decodeURIComponent(csrfCookie.split('=')[1]);
        }
      }

      if (!csrfToken) {
        const csrfResponse = await fetch('/csrf-token');
        const csrfData = await csrfResponse.json();
        csrfToken = csrfData.token;
      }

      if (!csrfToken) {
        throw new Error('Could not obtain CSRF token');
      }

      const response = await fetch('/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (response.status === 419) {
        throw new Error('CSRF token mismatch. Please refresh the page and try again.');
      }

      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({
          ...prev,
          [type === 'profile' ? 'profile_picture' : 'logo']: data.url
        }));
        showAlert('✅ Imagem enviada com sucesso!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);

      if (error.message.includes('CSRF')) {
        showAlert('❌ Sessão expirada. Recarregue a página e tente novamente.', 'error');
      } else {
        showAlert('❌ Erro no upload. Tente novamente.', 'error');
      }
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  }, [showAlert]);

  const removeImage = useCallback((type) => {
    setForm(prev => ({
      ...prev,
      [type === 'profile' ? 'profile_picture' : 'logo']: ''
    }));
  }, []);

  const handleColorThemeChange = useCallback((themeValue) => {
    setForm(prev => ({ ...prev, color_theme: themeValue }));
    if (errors.color_theme) {
      setErrors(prev => ({ ...prev, color_theme: null }));
    }
  }, [errors.color_theme]);

  const pageTitle = edit_mode ? 'Editar Cartão Digital' : 'Criar Meu Cartão Digital';
  const pageDescription = edit_mode
    ? 'Atualize as informações do seu cartão'
    : (is_purchase_flow ? 'Ative seu cartão premium' : 'Crie seu cartão digital personalizado');
  const finalButtonText = edit_mode
    ? 'Atualizar Cartão'
    : (is_purchase_flow ? 'Ativar Cartão Premium' : 'Finalizar Cartão');

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {edit_mode ? 'Atualizando...' : 'Criando Cartão...'}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  {finalButtonText}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateToRoute(edit_mode ? "/client/dashboard" : "/")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {edit_mode ? 'Voltar ao Dashboard' : 'Voltar ao Início'}
          </button>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Capinha Digital
            </h1>
            <p className="text-sm text-gray-600">
              {pageDescription}
            </p>
          </div>

          <div className="w-20" />
        </div>

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

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${step.number === currentStep
                  ? 'bg-blue-100 text-blue-700'
                  : step.number < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${step.number < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Informações Básicas</h2>
                    <p className="text-sm text-gray-600">
                      {edit_mode ? 'Atualize suas informações principais' : 'Vamos começar com suas informações principais'}
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
                      className="w-full mt-1 p-3 border border-gray-300 rounded-md bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      maxLength={150}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {form.bio.length}/150 caracteres
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Contato & Redes Sociais</h2>
                    <p className="text-sm text-gray-600">
                      Como as pessoas podem entrar em contato com você
                    </p>
                  </div>

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

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">Visual & Estilo</h2>
                    <p className="text-sm text-gray-600">
                      Personalize a aparência do seu cartão
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Foto de Perfil
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative">
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

                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Logo da Empresa (Opcional)
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative">
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
                          className={`p-3 rounded-lg border-2 transition-all ${form.color_theme === theme.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
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

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                      {edit_mode ? 'Confirmar Alterações' : 'Revisão Final'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {edit_mode
                        ? 'Verifique as alterações antes de salvar'
                        : (is_purchase_flow
                          ? 'Ative seu cartão premium com o código de compra'
                          : 'Verifique suas informações antes de criar o cartão'
                        )
                      }
                    </p>
                  </div>

                  {!edit_mode && is_purchase_flow && activation_code && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 text-green-700">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium">Código de Ativação Confirmado</span>
                          <p className="text-sm text-green-600 mt-1">
                            Código: <span className="font-mono font-bold">{activation_code}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-3 ml-11">
                        ✅ Seu cartão premium será ativado automaticamente
                      </p>
                    </div>
                  )}

                  {!edit_mode && is_purchase_flow && !activation_code && (
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

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-3">
                      {edit_mode ? 'Suas alterações:' : 'Resumo das suas informações:'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nome:</strong> {form.name || 'Não informado'}</div>
                      {form.job_title && <div><strong>Cargo:</strong> {form.job_title}</div>}
                      {form.company && <div><strong>Empresa:</strong> {form.company}</div>}
                      {form.email && <div><strong>Email:</strong> {form.email}</div>}
                      {form.phone && <div><strong>Telefone:</strong> {form.phone}</div>}
                      {form.whatsapp && <div><strong>WhatsApp:</strong> {form.whatsapp}</div>}
                      {form.website && <div><strong>Website:</strong> {form.website}</div>}
                      {form.location && <div><strong>Localização:</strong> {form.location}</div>}
                      <div><strong>Tema:</strong> {colorThemes.find(t => t.value === form.color_theme)?.name}</div>

                      {!edit_mode && is_purchase_flow && (
                        <div className="pt-2 border-t">
                          <strong>Tipo:</strong> <span className="text-blue-600 font-medium">Cartão Premium</span>
                        </div>
                      )}
                      {edit_mode && (
                        <div className="pt-2 border-t">
                          <strong>Ação:</strong> <span className="text-orange-600 font-medium">Editando Cartão Existente</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Card>

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

              {!edit_mode && is_purchase_flow && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Cartão Premium</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Recursos avançados, analytics e suporte prioritário incluídos
                  </p>
                </div>
              )}

              {edit_mode && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Modo de Edição</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    Alterações serão salvas no cartão existente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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

          <div className="flex items-center gap-2 text-sm text-gray-500">
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
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {finalButtonText}
            </Button>
          )}
        </div>

        {!edit_mode && is_purchase_flow && currentStep === 4 && !activation_code && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Não encontrou seu código de ativação?
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Verifique sua caixa de entrada e spam no email cadastrado</p>
              <p>• O código possui 6 caracteres (ex: ABC123)</p>
              <p>• Entre em contato conosco se não recebeu: suporte@capinhadigital.com.br</p>
            </div>
          </div>
        )}

        {edit_mode && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Dicas para edição
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Todas as alterações serão salvas no cartão existente</p>
              <p>• O link do seu cartão permanecerá o mesmo</p>
              <p>• As alterações aparecerão imediatamente para quem acessar seu cartão</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCardCreator;