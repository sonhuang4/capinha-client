import React from 'react';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { Mail, MessageCircle, Globe, Instagram } from 'lucide-react';

interface Props {
  card: {
    id: number;
    name: string;
    email?: string;
    profile_picture?: string;
    whatsapp?: string;
    instagram?: string;
    website?: string;
  };
}

const PublicCardView = ({ card }: Props) => {
  return (
    <>
      <Head title={`${card.name}'s Digital Card`} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 space-y-4">
          {card.profile_picture && (
            <img src={card.profile_picture} alt={card.name} className="w-24 h-24 rounded-full mx-auto border-4 border-purple-500" />
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
                    const url = res.data.whatsapp_url;
                    window.open(url, '_blank');
                  } catch (err) {
                    alert("Failed to generate WhatsApp link.");
                    console.error(err);
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
                  if (!confirm(`Send email to ${card.email}?`)) return;

                  try {
                    const res = await axios.get(`/cards/${card.id}/send-email`);

                    if (res.data.success) {
                      alert(`✅ Email sent to ${res.data.recipient}`);
                    } else {
                      alert(`❌ Failed: ${res.data.message}`);
                    }
                  } catch (err) {
                    alert("❌ An error occurred while sending the email.");
                    console.error(err);
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
