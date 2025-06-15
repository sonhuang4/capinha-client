import { Head, useForm } from '@inertiajs/react';
import { LogIn, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
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

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <Head title="Register" />
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
            Create an Account
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your details below to create your account
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-sm">Name</Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              required
              autoComplete="name"
              placeholder="Full name"
              disabled={processing}
            />
            <InputError message={errors.name} className="mt-1 text-xs" />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm">Email address</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              required
              autoComplete="email"
              placeholder="email@example.com"
              disabled={processing}
            />
            <InputError message={errors.email} className="mt-1 text-xs" />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={processing}
            />
            <InputError message={errors.password} className="mt-1 text-xs" />
          </div>

          <div>
            <Label htmlFor="password_confirmation" className="text-sm">Confirm password</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={processing}
            />
            <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
          </div>

          <Button
            type="submit"
            className="gradient-button w-full h-10 text-sm font-semibold"
            disabled={processing}
          >
            {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-xs text-center text-muted-foreground">
          Already have an account?{' '}
          <TextLink href={route('login')} className="underline text-xs">
            Log in
          </TextLink>
        </p>
      </Card>
    </div>
  );
}
