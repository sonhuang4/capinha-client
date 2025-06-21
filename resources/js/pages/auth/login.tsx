import { Head, useForm } from '@inertiajs/react';
import { LogIn, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

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
  const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
    email: '',
    password: '',
    remember: false,
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    
    if (!validateEmail(data.email)) {
      alert('Por favor, insira um endereço de email válido.');
      return;
    }
    
    post(route('login'), {
      onFinish: () => reset('password'),
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

        {status && (
          <div className="mb-3 text-center text-sm font-medium text-green-600">
            {status}
          </div>
        )}

        {(errors.email || errors.password) && (
          <div className="mb-3 p-3 text-center text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            {errors.email || errors.password || 'Erro ao fazer login. Verifique suas credenciais.'}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="email" className="text-sm">Endereço de email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              required
              autoComplete="email"
              placeholder="email@exemplo.com"
              disabled={processing}
              className={`${!data.email ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
              style={!data.email ? { borderColor: '#2f5afb' } : {}}
            />
            <InputError message={errors.email} className="mt-1 text-xs" />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm">Senha</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={processing}
              className={`${!data.password ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
              style={!data.password ? { borderColor: '#2f5afb' } : {}}
            />
            <InputError message={errors.password} className="mt-1 text-xs" />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              name="remember"
              checked={data.remember}
              onClick={() => setData('remember', !data.remember)}
              tabIndex={3}
            />
            <Label htmlFor="remember" className="text-sm">Lembrar de mim</Label>
          </div>

          <Button
            type="submit"
            className="gradient-button w-full h-10 text-sm font-semibold"
            disabled={processing}
          >
            {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
            Conectar-se
          </Button>
          <TextLink href={route('register')} className="underline text-xs">
            Cadastrar-se
          </TextLink>
        </form>
      </Card>
    </div>
  );
}