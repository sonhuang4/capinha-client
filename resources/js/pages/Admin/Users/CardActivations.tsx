import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layouts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

interface Activation {
  id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  location?: string;
}

interface CardData {
  id: number;
  name: string;
  activations: Activation[];
}

interface Props {
  card: CardData;
}

const CardActivations: React.FC<Props> = ({ card }) => {
  const handleExport = () => {
    window.open(`/admin/cards/${card.id}/activations/export`, '_blank');
  };

  return (
    <AdminLayout>
      <Head title={`Ativações - ${card.name}`} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Ativações de: {card.name}
          </h1>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            
            <Button
              onClick={() => router.visit('/dashboard')}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        <Card className="material-card overflow-x-auto">
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Total de ativações: <span className="font-semibold">{card.activations.length}</span>
              </p>
            </div>
            
            <table className="min-w-full text-sm">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Data</th>
                  <th className="text-left p-3 font-semibold">IP</th>
                  <th className="text-left p-3 font-semibold">Localização</th>
                  <th className="text-left p-3 font-semibold">Dispositivo / Navegador</th>
                </tr>
              </thead>
              <tbody>
                {card.activations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      <div className="space-y-2">
                        <p className="text-lg">📊 Nenhuma ativação registrada ainda</p>
                        <p className="text-sm">As ativações aparecerão aqui quando alguém visualizar este cartão.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  card.activations.map((activation) => (
                    <tr key={activation.id} className="border-b last:border-none hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">
                        {new Date(activation.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3 font-mono text-xs">{activation.ip_address}</td>
                      <td className="p-3 text-xs">{activation.location || 'N/A'}</td>
                      <td className="p-3 text-xs max-w-xs truncate" title={activation.user_agent}>
                        {activation.user_agent}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CardActivations;