import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layouts';

interface CardRequest {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  status: string;
  created_at: string;
}

interface Props {
  requests: CardRequest[];
}

export default function AdminRequests({ requests }: Props) {
  return (
    <AdminLayout>
      <Head title="Solicitações de Cartões" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">📥 Solicitações de Cartões</h1>

        {requests.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma solicitação no momento.</p>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <Card
                key={req.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{req.name}</h2>
                  <p className="text-sm text-muted-foreground">{req.email || 'Sem e-mail'}</p>
                  <p className="text-sm text-muted-foreground">{req.whatsapp || 'Sem WhatsApp'}</p>
                  <p className="text-sm text-muted-foreground">
                    Enviado em: {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center gap-4">
                  <Badge
                    variant={req.status === 'pending' ? 'secondary' : 'default'}
                  >
                    {req.status === 'pending' ? 'Pendente' : 'Processado'}
                  </Badge>

                  <button
                    onClick={() => {
                      console.log("Clicado:", req.id);
                      if (req.id) {
                        router.get(`/cards/create?request_id=${req.id}`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                  >
                    Criar cartão
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
