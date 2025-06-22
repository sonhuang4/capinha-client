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
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import { Switch } from '@/components/ui/switch';

// Basic UI Components with Dark Mode Support
const Input = ({ className = '', darkMode = false, ...props }) => (
  <input
    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      darkMode 
        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
        : 'border-gray-300 bg-white text-gray-900'
    } ${className}`}
    {...props}
  />
);

const Label = ({ className = '', children, darkMode = false, ...props }) => (
  <label className={`block text-sm font-medium mb-1 ${
    darkMode ? 'text-gray-200' : 'text-gray-700'
  } ${className}`} {...props}>
    {children}
  </label>
);

const Button = ({
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  children,
  darkMode = false,
  ...props
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: darkMode 
      ? "border border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 focus:ring-blue-500"
      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
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

const Card = ({ className = '', children, darkMode = false, ...props }) => (
  <div className={`rounded-lg border shadow-sm ${
    darkMode 
      ? 'bg-gray-900 border-gray-700' 
      : 'bg-white border-gray-200'
  } ${className}`} {...props}>
    {children}
  </div>
);

const Alert = ({ variant = 'default', className = '', children, darkMode = false, ...props }) => {
  const variants = {
    default: darkMode 
      ? "bg-blue-900/20 border-blue-700 text-blue-300"
      : "bg-blue-50 border-blue-200 text-blue-800",
    destructive: darkMode
      ? "bg-red-900/20 border-red-700 text-red-300"
      : "bg-red-50 border-red-200 text-red-800"
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

// Business Card Display Component with Dark Mode
const BusinessCardDisplay = ({ card, preview = false, darkMode = false }) => {
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
      <div className={`bg-gradient-to-br ${gradientClass} rounded-xl p-4 sm:p-6 text-white shadow-xl`}>
        <div className="flex items-start gap-3 sm:gap-4">
          {card.profile_picture ? (
            <img
              src={card.profile_picture}
              alt={card.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold truncate">{card.name || 'Seu Nome'}</h3>
            {card.job_title && (
              <p className="text-white/90 text-xs sm:text-sm">{card.job_title}</p>
            )}
            {card.company && (
              <p className="text-white/80 text-xs">{card.company}</p>
            )}
          </div>

          {card.logo && (
            <img
              src={card.logo}
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded object-contain bg-white/10 p-1"
            />
          )}
        </div>

        <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
          {card.email && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{card.phone}</span>
            </div>
          )}
          {card.whatsapp && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{card.whatsapp}</span>
            </div>
          )}
          {card.website && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">{card.website}</span>
            </div>
          )}
        </div>

        {(card.instagram || card.linkedin || card.twitter) && (
          <div className="mt-2 sm:mt-3 flex gap-2 sm:gap-3">
            {card.instagram && <Instagram className="w-3 h-3 sm:w-4 sm:h-4" />}
            {card.linkedin && <Linkedin className="w-3 h-3 sm:w-4 sm:h-4" />}
            {card.twitter && <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />}
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

// ValidatedInput component with Dark Mode
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
  darkMode = false,
  ...props
}) => {
  const isImportantField = ['name', 'color_theme', 'activation_code'].includes(name);

  return (
    <div>
      <Label htmlFor={name} className="text-sm font-medium flex items-center gap-1" darkMode={darkMode}>
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
          darkMode={darkMode}
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
  const [darkMode, setDarkMode] = useState(false);

  const [uploading, setUploading] = useState({ profile: false, logo: false });
  const profileInputRef = useRef(null);
  const logoInputRef = useRef(null);

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

    // ✅ STEP 1: CLIENT-SIDE VALIDATION
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

    // ✅ STEP 2: PREPARE SUBMIT DATA
    const submitData = {
      ...form,
      activation_code: (!edit_mode && is_purchase_flow) ? (activation_code || form.activation_code || null) : undefined
    };

    // Remove undefined values
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    console.log('Submitting:', edit_mode ? 'EDIT' : 'CREATE');
    console.log('Card ID:', card_id);
    console.log('Data:', submitData);

    if (edit_mode && card_id) {
      // ✅ EDIT MODE - Keep existing logic
      const result = await submitForm(`/client/cards/${card_id}`, submitData, 'POST');

      if (result.success) {
        showAlert('✅ Cartão atualizado com sucesso!', 'success');
        router.visit('/client/dashboard');
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
      // ✅ CREATE MODE - COMPLETE IMPLEMENTATION
      try {
        // ✅ STEP 3: GET CSRF TOKEN
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (!csrfToken) {
          const csrfResponse = await fetch('/csrf-token');
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.token;
        }

        // ✅ STEP 4: MAKE API CALL
        const response = await fetch('/cards/create-client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
          },
          body: JSON.stringify(submitData)
        });

        if (response.ok) {
          // ✅ STEP 5: SUCCESS - PARSE AND HANDLE RESPONSE
          const result = await response.json();
          console.log("SUCCESS! Full backend response:", result);

          // ✅ DESTRUCTURE THE BACKEND DATA
          const {
            success,
            message,
            card,
            payment,
            redirect_url,
            dashboard_url
          } = result;

          // ✅ LOG RECEIVED DATA FOR DEBUGGING
          console.log("Received card data:", {
            cardId: card?.id,
            cardCode: card?.code,
            cardSlug: card?.unique_slug,
            cardName: card?.name,
            publicUrl: card?.public_url,
            shortUrl: card?.short_url,
            paymentPlan: payment?.plan,
            redirectUrl: redirect_url
          });

          // ✅ UPDATE COMPONENT STATE
          setSuccessMessage(message || '✅ Cartão criado com sucesso!');

          // ✅ OPTIONAL: Store created card info for display
          if (card) {
            setForm(prev => ({
              ...prev,
              created_card_id: card.id,
              created_card_code: card.code,
              created_card_slug: card.unique_slug
            }));
          }

          // ✅ STEP 6: NAVIGATE TO SUCCESS PAGE
          // Priority order: redirect_url > unique_slug > dashboard
          if (redirect_url) {
            console.log("Redirecting to:", redirect_url);
            window.location.href = redirect_url;
          } else if (card && card.unique_slug) {
            console.log("Using Inertia router to:", `/card-success/${card.unique_slug}`);
            router.visit(`/card-success/${card.unique_slug}`, {
              replace: true
            });
          } else if (dashboard_url) {
            console.log("Fallback to dashboard:", dashboard_url);
            router.visit(dashboard_url);
          } else {
            console.log("Final fallback to client dashboard");
            router.visit('/client/dashboard');
          }

        } else {
          // ✅ STEP 7: ERROR - HANDLE ERROR RESPONSE
          const errorData = await response.json();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData
          });

          setErrors(errorData.errors || {});

          // ✅ PARSE ERROR MESSAGES WITH PRIORITY
          let errorMessage = '❌ Erro ao criar cartão.';

          if (errorData.errors?.activation_code) {
            errorMessage = '❌ ' + (Array.isArray(errorData.errors.activation_code)
              ? errorData.errors.activation_code[0]
              : errorData.errors.activation_code);
          } else if (errorData.errors?.general) {
            errorMessage = '❌ ' + (Array.isArray(errorData.errors.general)
              ? errorData.errors.general[0]
              : errorData.errors.general);
          } else if (errorData.errors?.contact) {
            errorMessage = '❌ ' + (Array.isArray(errorData.errors.contact)
              ? errorData.errors.contact[0]
              : errorData.errors.contact);
          } else if (errorData.message) {
            errorMessage = '❌ ' + errorData.message;
          } else if (response.status === 422) {
            errorMessage = '❌ Dados inválidos. Verifique os campos obrigatórios.';
          } else if (response.status === 401) {
            errorMessage = '❌ Sessão expirada. Faça login novamente.';
          } else if (response.status === 403) {
            errorMessage = '❌ Acesso negado. Verifique suas permissões.';
          } else if (response.status >= 500) {
            errorMessage = '❌ Erro interno do servidor. Tente novamente.';
          }

          setGeneralError(errorMessage);
        }

      } catch (error) {
        // ✅ STEP 8: NETWORK ERROR HANDLING
        console.error('Network/Parse error:', error);

        let networkError = '❌ Erro de conexão.';

        if (error.name === 'SyntaxError') {
          networkError = '❌ Erro ao processar resposta do servidor.';
        } else if (error.message.includes('fetch')) {
          networkError = '❌ Falha na conexão. Verifique sua internet.';
        } else {
          networkError = '❌ Erro inesperado. Tente novamente.';
        }

        setGeneralError(networkError + ' Tente novamente.');
      }
    }

    setIsSubmitting(false);
  }, [
    form,
    isSubmitting,
    is_purchase_flow,
    activation_code,
    edit_mode,
    card_id,
    router,
    showAlert
  ]);

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
      <div className={`min-h-screen py-6 sm:py-8 px-4 transition-all duration-300 ${darkMode ? 'dark' : ''}`}
           style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#ffffff', color: '#1f2937' }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center gap-2"
              darkMode={darkMode}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à Edição
            </Button>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Prévia do Cartão
            </h1>
          </div>

          <BusinessCardDisplay card={form} preview={true} darkMode={darkMode} />

          <div className="mt-6 space-y-3">
            {generalError && (
              <Alert variant="destructive" darkMode={darkMode}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3"
              disabled={isSubmitting}
              darkMode={darkMode}
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
    <div className={`min-h-screen py-6 sm:py-8 px-4 transition-all duration-300 ${darkMode ? 'dark' : ''}`}
         style={darkMode ? { backgroundColor: '#020818', color: '#ae9efd' } : { backgroundColor: '#ffffff', color: '#1f2937' }}>
      <Head title={pageTitle} />
      
      <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4">
          <button
            onClick={() => navigateToRoute(edit_mode ? "/client/dashboard" : "/")}
            className={`flex items-center gap-2 text-sm transition-colors ${
              darkMode 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            {edit_mode ? 'Voltar ao Dashboard' : 'Voltar ao Início'}
          </button>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              DigitalCard
            </h1>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {pageDescription}
            </p>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="data-[state=checked]:bg-purple-600 scale-75 sm:scale-100"
            />
            {darkMode ? <Moon className="w-3 h-3 sm:w-4 sm:h-4" /> : <Sun className="w-3 h-3 sm:w-4 sm:h-4" />}
          </div>
        </div>

        {generalError && (
          <Alert variant="destructive" className="mb-6" darkMode={darkMode}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className={`mb-6 ${
            darkMode 
              ? 'border-green-700 bg-green-900/20 text-green-300' 
              : 'border-green-200 bg-green-50 text-green-800'
          }`} darkMode={darkMode}>
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  step.number === currentStep
                    ? darkMode
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                    : step.number < currentStep
                      ? darkMode
                        ? 'bg-green-900/30 text-green-300'
                        : 'bg-green-100 text-green-700'
                      : darkMode
                        ? 'bg-gray-800 text-gray-400'
                        : 'bg-gray-100 text-gray-500'
                }`}>
                  <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.number}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-4 sm:w-8 h-0.5 ${
                    step.number < currentStep 
                      ? 'bg-green-300' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6" darkMode={darkMode}>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-4 sm:mb-6">
                    <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Informações Básicas
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                    darkMode={darkMode}
                  />

                  <ValidatedInput
                    name="job_title"
                    label="Cargo/Profissão"
                    icon={Building2}
                    placeholder="Ex: Desenvolvedor, Designer, CEO"
                    value={form.job_title}
                    onChange={handleChange}
                    error={errors.job_title}
                    darkMode={darkMode}
                  />

                  <ValidatedInput
                    name="company"
                    label="Empresa"
                    icon={Building2}
                    placeholder="Nome da sua empresa"
                    value={form.company}
                    onChange={handleChange}
                    error={errors.company}
                    darkMode={darkMode}
                  />

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium" darkMode={darkMode}>
                      Descrição (Opcional)
                    </Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Uma breve descrição sobre você ou seu trabalho..."
                      className={`w-full mt-1 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                      rows={3}
                      maxLength={150}
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {form.bio.length}/150 caracteres
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-4 sm:mb-6">
                    <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Contato & Redes Sociais
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Como as pessoas podem entrar em contato com você
                    </p>
                  </div>

                  {errors.contact && (
                    <Alert variant="destructive" className="mb-4" darkMode={darkMode}>
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
                      darkMode={darkMode}
                    />

                    <ValidatedInput
                      name="phone"
                      label="Telefone"
                      icon={Phone}
                      placeholder="(11) 99999-9999"
                      value={form.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      darkMode={darkMode}
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
                    darkMode={darkMode}
                  />

                  <ValidatedInput
                    name="website"
                    label="Website"
                    icon={Globe}
                    placeholder="https://seusite.com"
                    value={form.website}
                    onChange={handleChange}
                    error={errors.website}
                    darkMode={darkMode}
                  />

                  <ValidatedInput
                    name="location"
                    label="Localização"
                    icon={MapPin}
                    placeholder="São Paulo, SP"
                    value={form.location}
                    onChange={handleChange}
                    error={errors.location}
                    darkMode={darkMode}
                  />

                  <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Redes Sociais (Opcional)
                    </h3>
                    <div className="space-y-3">
                      <ValidatedInput
                        name="instagram"
                        label="Instagram"
                        icon={Instagram}
                        placeholder="@seuusuario"
                        value={form.instagram}
                        onChange={handleChange}
                        error={errors.instagram}
                        darkMode={darkMode}
                      />

                      <ValidatedInput
                        name="linkedin"
                        label="LinkedIn"
                        icon={Linkedin}
                        placeholder="linkedin.com/in/seuusuario"
                        value={form.linkedin}
                        onChange={handleChange}
                        error={errors.linkedin}
                        darkMode={darkMode}
                      />

                      <ValidatedInput
                        name="twitter"
                        label="Twitter"
                        icon={Twitter}
                        placeholder="@seuusuario"
                        value={form.twitter}
                        onChange={handleChange}
                        error={errors.twitter}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Visual & Estilo
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Personalize a aparência do seu cartão
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block" darkMode={darkMode}>
                      Foto de Perfil
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed relative ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600' 
                          : 'bg-gray-100 border-gray-300'
                      }`}>
                        {form.profile_picture ? (
                          <>
                            <img src={form.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage('profile')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <User className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
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
                          darkMode={darkMode}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading.profile ? 'Enviando...' : 'Enviar Foto'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block" darkMode={darkMode}>
                      Logo da Empresa (Opcional)
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed relative ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600' 
                          : 'bg-gray-100 border-gray-300'
                      }`}>
                        {form.logo ? (
                          <>
                            <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => removeImage('logo')}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <Building2 className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
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
                          darkMode={darkMode}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading.logo ? 'Enviando...' : 'Enviar Logo'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center gap-1" darkMode={darkMode}>
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
                              ? darkMode
                                ? 'border-blue-500 bg-blue-900/20'
                                : 'border-blue-500 bg-blue-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-full h-6 sm:h-8 rounded-md bg-gradient-to-r ${theme.gradient} mb-2`} />
                          <p className={`text-xs font-medium ${
                            darkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {theme.name}
                          </p>
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
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {edit_mode ? 'Confirmar Alterações' : 'Revisão Final'}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                    <div className={`rounded-lg p-4 ${
                      darkMode 
                        ? 'bg-green-900/20 border border-green-700' 
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className={`flex items-center gap-3 ${
                        darkMode ? 'text-green-300' : 'text-green-700'
                      }`}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          darkMode ? 'bg-green-800' : 'bg-green-100'
                        }`}>
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium">Código de Ativação Confirmado</span>
                          <p className={`text-sm mt-1 ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            Código: <span className="font-mono font-bold">{activation_code}</span>
                          </p>
                        </div>
                      </div>
                      <p className={`text-xs mt-3 ml-11 ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        ✅ Seu cartão premium será ativado automaticamente
                      </p>
                    </div>
                  )}

                  {!edit_mode && is_purchase_flow && !activation_code && (
                    <div className="space-y-4">
                      <Alert className={`${
                        darkMode 
                          ? 'border-amber-700 bg-amber-900/20 text-amber-300' 
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`} darkMode={darkMode}>
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
                        darkMode={darkMode}
                      />
                    </div>
                  )}

                  <div className={`rounded-lg p-4 ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <h3 className={`font-medium mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {edit_mode ? 'Suas alterações:' : 'Resumo das suas informações:'}
                    </h3>
                    <div className={`space-y-2 text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
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
                        <div className={`pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <strong>Tipo:</strong> <span className="text-blue-600 font-medium">Cartão Premium</span>
                        </div>
                      )}
                      {edit_mode && (
                        <div className={`pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
              <h3 className={`text-base sm:text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Prévia do Cartão
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(true)}
                className="flex items-center gap-2"
                darkMode={darkMode}
              >
                <Eye className="w-4 h-4" />
                Visualizar Completo
              </Button>
            </div>

            <div className="sticky top-4 sm:top-8">
              <BusinessCardDisplay card={form} preview={true} darkMode={darkMode} />

              {!edit_mode && is_purchase_flow && (
                <div className={`mt-4 p-3 rounded-lg ${
                  darkMode 
                    ? 'bg-blue-900/20 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className={`flex items-center gap-2 text-sm ${
                    darkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Cartão Premium</span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    Recursos avançados, analytics e suporte prioritário incluídos
                  </p>
                </div>
              )}

              {edit_mode && (
                <div className={`mt-4 p-3 rounded-lg ${
                  darkMode 
                    ? 'bg-orange-900/20 border border-orange-700' 
                    : 'bg-orange-50 border border-orange-200'
                }`}>
                  <div className={`flex items-center gap-2 text-sm ${
                    darkMode ? 'text-orange-300' : 'text-orange-700'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Modo de Edição</span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    Alterações serão salvas no cartão existente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2"
            darkMode={darkMode}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className={`flex items-center gap-2 text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Passo {currentStep} de {steps.length}
          </div>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="flex items-center gap-2"
              darkMode={darkMode}
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setIsPreviewMode(true)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-2"
              darkMode={darkMode}
            >
              <Sparkles className="w-4 h-4" />
              {finalButtonText}
            </Button>
          )}
        </div>

        {!edit_mode && is_purchase_flow && currentStep === 4 && !activation_code && (
          <div className={`mt-6 sm:mt-8 p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h4 className={`font-medium mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Não encontrou seu código de ativação?
            </h4>
            <div className={`text-sm space-y-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>• Verifique sua caixa de entrada e spam no email cadastrado</p>
              <p>• O código possui 6 caracteres (ex: ABC123)</p>
              <p>• Entre em contato conosco se não recebeu: suporte@digitalcard.com.br</p>
            </div>
          </div>
        )}

        {edit_mode && (
          <div className={`mt-6 sm:mt-8 p-4 rounded-lg ${
            darkMode 
              ? 'bg-blue-900/20 border border-blue-700' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              darkMode ? 'text-blue-300' : 'text-blue-900'
            }`}>
              💡 Dicas para edição
            </h4>
            <div className={`text-sm space-y-1 ${
              darkMode ? 'text-blue-200' : 'text-blue-700'
            }`}>
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