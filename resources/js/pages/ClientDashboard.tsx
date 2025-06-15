import React from 'react';
import { Head } from '@inertiajs/react';
import { QRCodeCanvas } from 'qrcode.react';

interface Props {
  card: {
    id: number;
    name: string;
    code: string;
    click_count: number;
    profile_picture?: string;
  } | null;
}

const ClientDashboard = ({ card }: Props) => {
  if (!card) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhum cartão associado à sua conta ainda.
      </div>
    );
  }

  const shortLink = `https://cartaointeligente.com.br/c/${card.code}`;

  return (
    <>
      <Head title="Meu Cartão" />
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Olá, {card.name}
        </h1>

        {card.profile_picture && (
          <img
            src={card.profile_picture}
            alt={card.name}
            className="w-24 h-24 rounded-full mx-auto border-4 border-purple-500"
          />
        )}

        <div className="text-center space-y-2">
          <p className="text-sm">Link do seu cartão:</p>
          <a
            href={shortLink}
            target="_blank"
            className="text-blue-600 underline"
          >
            {shortLink}
          </a>
          <p className="text-sm text-muted-foreground">
            Total de visualizações: {card.click_count}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="mb-2 text-sm text-muted-foreground">QR Code do seu cartão</p>
          <QRCodeCanvas value={shortLink} size={200} includeMargin />
        </div>
      </div>
    </>
  );
};

export default ClientDashboard;
