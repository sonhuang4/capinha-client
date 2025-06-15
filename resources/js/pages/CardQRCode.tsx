import React from 'react';
import { QRCodeCanvas  } from 'qrcode.react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layouts';

interface Props {
  card: {
    id: number;
    name: string;
    code: string;
  };
}

const CardQRCode = ({ card }: Props) => {
  const url = `http://localhost:8000/c/${card.code}`;

  return (
    <AdminLayout>
      <Head title={`QR Code - ${card.name}`} />
      <div className="p-6 flex flex-col items-center space-y-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
          QR Code de {card.name}
        </h1>

        <QRCodeCanvas value={url} size={240} includeMargin />

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          {url}
        </a>

        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:underline mt-4"
        >
          ← Voltar ao Painel
        </Link>
      </div>
    </AdminLayout>
  );
};

export default CardQRCode;
