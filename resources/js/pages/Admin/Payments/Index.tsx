import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layouts';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  X, 
  Eye,
  Clock,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';

interface Payment {
  id: number;
  payment_id: string;
  status: string;
  status_name: string;
  plan: string;
  plan_name: string;
  amount: number;
  formatted_amount: string;
  payment_method: string;
  payment_method_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  paid_at: string | null;
  time_ago: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  card: {
    id: number;
    name: string;
    code: string;
    url: string;
  } | null;
  can_create_card: boolean;
}

interface Props {
  payments: {
    data: Payment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total_payments: number;
    pending_payments: number;
    paid_payments: number;
    failed_payments: number;
    total_revenue: number;
    today_revenue: number;
    month_revenue: number;
    conversion_rate: number;
    payments_today: number;
    payments_this_month: number;
  };
}

export default function AdminPayments({ payments, stats }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isConfirming, setIsConfirming] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <X className="w-4 h-4" />;
      case 'refunded': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const confirmPayment = async (paymentId: number) => {
    if (!confirm('Confirmar este pagamento?')) return;
    
    setIsConfirming(paymentId);
    
    try {
      await router.post(`/admin/payments/${paymentId}/confirm`, {
        action: 'confirm',
        notes: 'Confirmado manualmente pelo admin'
      }, {
        preserveState: true,
        onSuccess: () => {
          alert('Pagamento confirmado com sucesso!');
        },
        onError: () => {
          alert('Erro ao confirmar pagamento');
        },
        onFinish: () => {
          setIsConfirming(null);
        }
      });
    } catch (error) {
      setIsConfirming(null);
    }
  };

  const filteredPayments = payments.data.filter(payment => {
    const matchesSearch = payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <Head title="Pagamentos - Admin" />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💳 Pagamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie todos os pagamentos da plataforma</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total_payments}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_payments}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.paid_payments}</div>
                <div className="text-sm text-gray-600">Pagos</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {stats.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-600">Receita Total</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.conversion_rate}%</div>
                <div className="text-sm text-gray-600">Conversão</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.payments_today}</div>
                <div className="text-sm text-gray-600">Hoje</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou ID do pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="failed">Falhou</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </Card>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">💳</div>
            <p className="text-gray-600">Nenhum pagamento encontrado</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    {/* Payment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {payment.customer_name}
                        </h3>
                        <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1`}>
                          {getStatusIcon(payment.status)}
                          {payment.status_name}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <strong>ID:</strong> {payment.payment_id}
                        </div>
                        <div>
                          <strong>Plano:</strong> {payment.plan_name}
                        </div>
                        <div>
                          <strong>Valor:</strong> {payment.formatted_amount}
                        </div>
                        <div>
                          <strong>Método:</strong> {payment.payment_method_name}
                        </div>
                        <div>
                          <strong>Email:</strong> {payment.customer_email}
                        </div>
                        <div>
                          <strong>Criado:</strong> {payment.time_ago}
                        </div>
                        {payment.paid_at && (
                          <div>
                            <strong>Pago em:</strong> {payment.paid_at}
                          </div>
                        )}
                        {payment.card && (
                          <div>
                            <strong>Cartão:</strong> 
                            <a href={payment.card.url} target="_blank" className="text-blue-600 hover:underline ml-1">
                              {payment.card.code}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {payment.status === 'pending' && (
                        <Button
                          onClick={() => confirmPayment(payment.id)}
                          disabled={isConfirming === payment.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isConfirming === payment.id ? (
                            'Confirmando...'
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </>
                          )}
                        </Button>
                      )}
                      
                      {payment.status === 'paid' && !payment.card && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          Aguardando criação do cartão
                        </Badge>
                      )}
                      
                      {payment.card && (
                        <Button
                          onClick={() => window.open(payment.card.url, '_blank')}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Cartão
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {payments.last_page > 1 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {Math.min(payments.per_page, filteredPayments.length)} de {payments.total} pagamentos
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={payments.current_page === 1}>
                  Anterior
                </Button>
                <Button size="sm" variant="outline" disabled={payments.current_page === payments.last_page}>
                  Próximo
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}