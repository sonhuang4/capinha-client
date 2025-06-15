import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Mail, MessageCircle, Globe, Instagram } from 'lucide-react';

const themeColors: Record<string, string> = {
  blue: 'border-blue-500 text-blue-600',
  purple: 'border-purple-500 text-purple-600',
  green: 'border-green-500 text-green-600',
  pink: 'border-pink-500 text-pink-600',
  orange: 'border-orange-500 text-orange-600',
};

const PublicCardView = () => {
  const { props } = usePage();
  const code = props.code as string;

  const [card, setCard] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios
      .get(`/cards/by-code/${code}`)
      .then((res) => {
        const data = res.data;
        if (data.status === 'pending') {
          setNotFound(true);
        } else {
          setCard(data);
          axios.post(`/cards/${data.id}/activate`).catch(console.error);
        }
      })
      .catch(() => {
        setNotFound(true);
      });
  }, [code]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Cartão não encontrado</h1>
          <p className="text-muted-foreground">
            Este cartão está pendente ou o link é inválido.
          </p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const themeClass = themeColors[card.color_theme] || themeColors.blue;

  return (
    <>
      <Head title={`${card.name} | Cartão Digital`} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 flex flex-col items-center justify-center text-center">
        <div
          className={`max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 space-y-4 border-4 ${themeClass}`}
        >
          {card.profile_picture && (
            <img
              src={card.profile_picture}
              alt={card.name}
              className="w-24 h-24 rounded-full mx-auto border"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{card.name}</h1>
          {card.email && <p className="text-sm text-blue-600">{card.email}</p>}

          <div className="grid grid-cols-2 gap-4 pt-4">
            {card.whatsapp && (
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await axios.get(`/cards/${card.id}/whatsapp-share`);
                    window.open(res.data.whatsapp_url, '_blank');
                  } catch {
                    alert("Erro ao gerar link do WhatsApp.");
                  }
                }}
                className="flex flex-col items-center gap-1 text-emerald-600 hover:text-emerald-800"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm">WhatsApp</span>
              </a>
            )}

            {card.email && (
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  if (!confirm(`Enviar email para ${card.email}?`)) return;
                  try {
                    const res = await axios.get(`/cards/${card.id}/send-email`);
                    if (res.data.success) {
                      alert(`✅ Email enviado para ${res.data.recipient}`);
                    } else {
                      alert(`❌ Falha: ${res.data.message}`);
                    }
                  } catch {
                    alert("❌ Erro ao enviar o email.");
                  }
                }}
                className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Mail className="w-6 h-6" />
                <span className="text-sm">Email</span>
              </a>
            )}

            {card.instagram && (
              <a
                href={`https://instagram.com/${card.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-pink-500 hover:text-pink-700"
              >
                <Instagram className="w-6 h-6" />
                <span className="text-sm">Instagram</span>
              </a>
            )}

            {card.website && (
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 text-indigo-600 hover:text-indigo-800"
              >
                <Globe className="w-6 h-6" />
                <span className="text-sm">Website</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicCardView;
