import { Head, useForm } from '@inertiajs/react';
import { LogIn, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm<Required<LoginForm>>({
    email: '',
    password: '',
    remember: false,
  });

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.email || errors.password) {
      const timer = setTimeout(() => {
        clearErrors();
      }, 5000); // Clear errors after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [errors, clearErrors]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'remember' ? e.target.checked : e.target.value;
    setData(field, value as any);
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (processing) {
      console.log('Already processing login, ignoring duplicate request');
      return;
    }
    
    // Clear any existing errors
    clearErrors();
    
    // Client-side validation
    const validationErrors: Partial<LoginForm> = {};
    
    if (!data.email.trim()) {
      validationErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(data.email)) {
      validationErrors.email = 'Por favor, insira um endereço de email válido';
    }
    
    if (!data.password.trim()) {
      validationErrors.password = 'Senha é obrigatória';
    }
    
    // If validation fails, show errors and return
    if (Object.keys(validationErrors).length > 0) {
      console.log('Client-side validation failed:', validationErrors);
      return;
    }
    
    console.log('Submitting login form...', {
      email: data.email,
      hasPassword: !!data.password,
      remember: data.remember
    });
    
    // Submit the form
    post(route('login'), {
      onStart: () => {
        console.log('Login request started');
      },
      onSuccess: (page) => {
        console.log('Login successful, redirecting...', page);
        reset('password');
      },
      onError: (errors) => {
        console.log('Login failed with errors:', errors);
        reset('password');
      },
      onFinish: () => {
        console.log('Login request finished');
      },
      preserveScroll: true,
      replace: true, // Use replace to avoid history issues
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <Head title="Entrar" />
      <AnimatedBackground />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm p-6 shadow-xl rounded-xl bg-card text-card-foreground z-10 animate-fade-in">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Bem vindo de volta
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Insira suas credenciais para efetuar login
          </p>
        </div>

        {/* Success Status Message */}
        {status && (
          <div className="mb-3 text-center text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
            {status}
          </div>
        )}

        {/* General Error Message */}
        {(errors.email || errors.password) && (
          <div className="mb-3 p-3 text-center text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>
                {errors.email || errors.password || 'Credenciais inválidas. Verifique seu email e senha.'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3" noValidate>
          <div>
            <Label htmlFor="email" className="text-sm">Endereço de email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={handleInputChange('email')}
              autoComplete="email"
              placeholder="email@exemplo.com"
              disabled={processing}
              className={`${
                !data.email || errors.email
                  ? 'bg-blue-50 dark:bg-blue-950/20' 
                  : ''
              }`}
              style={
                !data.email || errors.email
                  ? { borderColor: '#2f5afb' } 
                  : {}
              }
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <InputError 
                id="email-error"
                message={errors.email} 
                className="mt-1 text-xs" 
              />
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm">Senha</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={handleInputChange('password')}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={processing}
              className={`${
                !data.password || errors.password
                  ? 'bg-blue-50 dark:bg-blue-950/20' 
                  : ''
              }`}
              style={
                !data.password || errors.password
                  ? { borderColor: '#2f5afb' } 
                  : {}
              }
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <InputError 
                id="password-error"
                message={errors.password} 
                className="mt-1 text-xs" 
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              name="remember"
              checked={data.remember}
              onCheckedChange={(checked) => setData('remember', !!checked)}
              disabled={processing}
            />
            <Label htmlFor="remember" className="text-sm">Lembrar de mim</Label>
          </div>

          <Button
            type="submit"
            className="gradient-button w-full h-10 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
            aria-describedby={processing ? 'login-status' : undefined}
          >
            {processing ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                <span id="login-status">Conectando...</span>
              </>
            ) : (
              'Conectar-se'
            )}
          </Button>

          <div className="flex items-center justify-between text-xs">
            <TextLink href={route('register')} className="underline">
              Cadastrar-se
            </TextLink>
            
            {canResetPassword && (
              <TextLink href={route('password.request')} className="underline">
                Esqueceu a senha?
              </TextLink>
            )}
          </div>
        </form>

        {/* Development Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <details>
              <summary className="cursor-pointer font-semibold">🐛 Debug Info</summary>
              <div className="mt-2 space-y-1">
                <div><strong>Processing:</strong> {processing ? 'Yes' : 'No'}</div>
                <div><strong>Has Errors:</strong> {Object.keys(errors).length > 0 ? 'Yes' : 'No'}</div>
                <div><strong>Email Valid:</strong> {data.email ? validateEmail(data.email) ? 'Yes' : 'No' : 'Empty'}</div>
                <div><strong>Password Length:</strong> {data.password.length}</div>
                <div><strong>Remember:</strong> {data.remember ? 'Yes' : 'No'}</div>
                {Object.keys(errors).length > 0 && (
                  <div><strong>Errors:</strong> {JSON.stringify(errors, null, 2)}</div>
                )}
              </div>
            </details>
          </div>
        )}
      </Card>
    </div>
  );
}