import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const RequestThanks = () => {
  return (
    <>
      <Head title="Obrigado" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
        <div className="bg-card text-card-foreground rounded-xl shadow-xl p-10 max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Obrigado pela sua solicitação!
          </h1>
          <p>Entraremos em contato em breve.</p>
          <Link href="/">
            <Button className="gradient-button">Voltar à Página Inicial</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default RequestThanks;
