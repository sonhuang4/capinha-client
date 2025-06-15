import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layouts';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface Activation {
  id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface Props {
  card: {
    id: number;
    name: string;
    activations: Activation[];
  };
}

const CardActivations = ({ card }: Props) => {
  return (
    <AdminLayout>
      <Head title={`Ativações - ${card.name}`} />
      <a
        href={`/cards/${card.id}/activations/export`}
        className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium shadow inline-block"
      >
        📥 Exportar CSV
      </a>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Ativações de: {card.name}
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
        </div>

        <Card className="material-card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="text-left p-3 font-semibold">Data</th>
                <th className="text-left p-3 font-semibold">IP</th>
                <th className="text-left p-3 font-semibold">Dispositivo / Navegador</th>
              </tr>
            </thead>
            <tbody>
              {card.activations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-muted-foreground">
                    Nenhuma ativação registrada ainda.
                  </td>
                </tr>
              ) : (
                card.activations.map((act) => (
                  <tr key={act.id} className="border-b last:border-none">
                    <td className="p-3">{act.created_at}</td>
                    <td className="p-3">{act.ip_address}</td>
                    <td className="p-3">{act.user_agent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CardActivations;
