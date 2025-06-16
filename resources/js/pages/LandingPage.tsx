import React from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

const LandingPage = () => {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center px-6 overflow-hidden">
      
      {/* Background Glow + Image */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.08),transparent)] w-full h-full absolute" />
        <img
          src="/images/phone-mockup.png"
          alt="Phone with digital card"
          className="absolute right-0 bottom-0 max-w-[400px] hidden lg:block opacity-80 translate-y-6 animate-fade-in-slow"
        />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Content */}
      <div className="max-w-3xl w-full text-center space-y-8 animate-fade-in-up z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Capinha Digital
          </h1>
          <a
            href="/auth/redirect"
            className="text-sm text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1"
          >
            <LogIn className="w-4 h-4" />
            Login de administrador
          </a>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Seu cartão de visita digital com NFC
        </h2>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Compartilhe seus contatos, redes sociais e links com um toque. Personalize, gerencie e envie sua presença digital em segundos.
        </p>

        {/* CTA */}
        <div className="flex justify-center">
          <Link href="/request">
            <Button className="gradient-button px-6 py-3 rounded-full text-md font-semibold gap-2">
              <Sparkles className="w-5 h-5" />
              Criar meu cartão
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-8">
          © {new Date().getFullYear()} Capinha Digital. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
