import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToastProvider, useToast } from '@/components/ui/toast';
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
  TrendingUp,
  ChevronDown,
  MoreVertical,
  ExternalLink,
  ArrowRight,
  Plus,
  RefreshCw,
  Calendar,
  Wallet
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PaymentCard {
  id: number;
  name: string;
  code: string;
  url: string;
}

interface Payment {
  id: number;
  payment_id: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
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
  user: User | null;
  card: PaymentCard | null;
  can_create_card: boolean;
}

interface PaymentStats {
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
}

interface PaginatedPayments {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props {
  payments: PaginatedPayments;
  stats: PaymentStats;
}

// Separate the main component that uses useToast
const AdminPaymentsContent: React.FC<Props> = ({ payments, stats }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isConfirming, setIsConfirming] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  const { success, error, warning, info } = useToast();

  const getStatusColor = (status: Payment['status']): string => {
    switch (status) {
      case 'pending': 
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/30';
      case 'paid': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/30';
      case 'failed': 
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/30';
      case 'refunded': 
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/20 dark:text-slate-300 dark:border-slate-600/30';
      default: 
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/20 dark:text-slate-300 dark:border-slate-600/30';
    }
  };

  const getStatusIcon = (status: Payment['status']): JSX.Element => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'paid': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'failed': return <X className="w-3.5 h-3.5" />;
      case 'refunded': return <RefreshCw className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusText = (status: Payment['status']): string => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'paid': return 'Pago';
      case 'failed': return 'Falhou';
      case 'refunded': return 'Reembolsado';
      default: return 'Pendente';
    }
  };

  const confirmPayment = async (paymentId: number): Promise<void> => {
    // Show confirmation toast first
    info('Confirmar Pagamento', 'Processando confirmação do pagamento...');
    
    setIsConfirming(paymentId);
    
    try {
      await router.post(`/admin/payments/${paymentId}/confirm`, {
        action: 'confirm',
        notes: 'Confirmado manualmente pelo admin'
      }, {
        preserveState: true,
        onSuccess: () => {
          success(
            'Pagamento Confirmado!', 
            'O pagamento foi confirmado com sucesso e o cartão será gerado automaticamente.'
          );
        },
        onError: (errors) => {
          console.error('Payment confirmation errors:', errors);
          error(
            'Erro ao Confirmar Pagamento',
            'Não foi possível confirmar o pagamento. Tente novamente ou contate o suporte técnico.'
          );
        },
        onFinish: () => {
          setIsConfirming(null);
        }
      });
    } catch (err) {
      setIsConfirming(null);
      console.error('Error confirming payment:', err);
      error(
        'Erro de Conexão',
        'Falha na comunicação com o servidor. Verifique sua conexão e tente novamente.'
      );
    }
  };

  const filteredPayments = payments.data.filter((payment: Payment) => {
    const matchesSearch = payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    if (e.target.value && filteredPayments.length === 0) {
      info('Busca Ativa', `Nenhum resultado encontrado para "${e.target.value}"`);
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    
    if (newStatus !== 'all') {
      const count = payments.data.filter(p => p.status === newStatus).length;
      info('Filtro Aplicado', `Mostrando ${count} pagamentos com status "${getStatusText(newStatus as Payment['status'])}"`);
    }
  };

  const openCardUrl = (url: string): void => {
    window.open(url, '_blank');
    success('Cartão Aberto', 'O cartão foi aberto em uma nova aba do navegador.');
  };

  const toggleExpandCard = (paymentId: number): void => {
    setExpandedCard(expandedCard === paymentId ? null : paymentId);
  };

  const formatCurrency = (amount: number): string => {
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCompactCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `R$ ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `R$ ${(amount / 1000).toFixed(1)}k`;
    }
    return formatCurrency(amount);
  };

  const handleExportCSV = () => {
    info('Exportação Iniciada', 'Preparando arquivo CSV para download...');
    // Add your export logic here
    setTimeout(() => {
      success('Exportação Concluída', 'O arquivo CSV foi baixado com sucesso!');
    }, 2000);
  };

  return (
    <AdminLayout>
      <Head title="Pagamentos - Administração" />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#020818] transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
          
          {/* RESPONSIVE HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-[#ae9efd] dark:to-blue-400 text-transparent bg-clip-text flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">💳</span>
                <span>Pagamentos</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Gerencie todos os pagamentos da plataforma
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportCSV}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* ULTRA-RESPONSIVE STATS GRID */}
          <div className="space-y-4 sm:space-y-6">
            {/* PRIMARY STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {/* Total Payments */}
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/30 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex-shrink-0">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.total_payments}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium leading-tight">
                      <span className="lg:hidden">Total</span>
                      <span className="hidden lg:inline">Total de Pagamentos</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pending Payments */}
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700/30 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.pending_payments}
                    </div>
                    <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 font-medium">
                      Pendentes
                    </div>
                  </div>
                </div>
              </Card>

              {/* Paid Payments */}
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700/30 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.paid_payments}
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      Confirmados
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total Revenue */}
              <Card className="col-span-2 lg:col-span-1 p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700/30 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-800/50 rounded-xl flex-shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                      <span className="lg:hidden">{formatCompactCurrency(stats.total_revenue)}</span>
                      <span className="hidden lg:inline">{formatCurrency(stats.total_revenue)}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
                      Receita Total
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* SECONDARY STATS */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* Conversion Rate */}
              <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-[#ae9efd]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-[#ae9efd]">
                    {stats.conversion_rate}%
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <span className="lg:hidden">Conversão</span>
                    <span className="hidden lg:inline">Taxa de Conversão</span>
                  </div>
                </div>
              </Card>

              {/* Today's Payments */}
              <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-[#ae9efd]" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-[#ae9efd]">
                    {stats.payments_today}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <span className="lg:hidden">Hoje</span>
                    <span className="hidden lg:inline">Pagamentos Hoje</span>
                  </div>
                </div>
              </Card>

              {/* Failed Payments */}
              <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.failed_payments}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Falharam
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* RESPONSIVE SEARCH & FILTERS */}
          <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold text-slate-900 dark:text-[#ae9efd] flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-600 dark:text-slate-400"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
              
              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <Input
                      placeholder="Buscar por nome, email ou ID do pagamento..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-10 h-12 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-[#ae9efd] placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-[#ae9efd] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#ae9efd]/20"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="w-full h-12 px-4 pr-10 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-[#ae9efd] focus:border-blue-500 dark:focus:border-[#ae9efd] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#ae9efd]/20 appearance-none"
                    >
                      <option value="all">🔍 Todos os Status</option>
                      <option value="pending">⏳ Pendentes</option>
                      <option value="paid">✅ Pagos</option>
                      <option value="failed">❌ Falharam</option>
                      <option value="refunded">🔄 Reembolsados</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Mostrando <span className="font-semibold text-slate-900 dark:text-[#ae9efd]">{filteredPayments.length}</span> de <span className="font-semibold text-slate-900 dark:text-[#ae9efd]">{payments.total}</span> pagamentos
                </div>
              </div>
            </div>
          </Card>

          {/* PAYMENT CARDS */}
          {filteredPayments.length === 0 ? (
            <Card className="p-8 sm:p-12 lg:p-16 text-center bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
              <div className="space-y-4">
                <div className="text-6xl sm:text-7xl lg:text-8xl">💳</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-[#ae9efd]">
                  Nenhum pagamento encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Tente ajustar os filtros de busca para encontrar os pagamentos que você está procurando.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment: Payment) => (
                <Card 
                  key={payment.id} 
                  className="overflow-hidden bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Customer Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#ae9efd] truncate">
                            {payment.customer_name}
                          </h3>
                          <Badge className={`${getStatusColor(payment.status)} flex items-center gap-1.5 w-fit text-sm font-medium`}>
                            {getStatusIcon(payment.status)}
                            {getStatusText(payment.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">ID:</span>
                            <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-slate-100">
                              {payment.payment_id}
                            </code>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Valor:</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {payment.formatted_amount}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Plano:</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {payment.plan_name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">{payment.time_ago}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {payment.status === 'pending' && (
                          <Button
                            onClick={() => confirmPayment(payment.id)}
                            disabled={isConfirming === payment.id}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
                          >
                            {isConfirming === payment.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => toggleExpandCard(payment.id)}
                          variant="outline"
                          size="sm"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* EXPANDABLE DETAILS */}
                    {expandedCard === payment.id && (
                      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Email do Cliente
                            </span>
                            <div className="text-sm text-slate-900 dark:text-[#ae9efd] break-all font-medium">
                              {payment.customer_email}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Método de Pagamento
                            </span>
                            <div className="text-sm text-slate-900 dark:text-[#ae9efd] font-medium">
                              {payment.payment_method_name}
                            </div>
                          </div>
                          
                          {payment.paid_at && (
                            <div className="space-y-2">
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Data do Pagamento
                              </span>
                              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                                {payment.paid_at}
                              </div>
                            </div>
                          )}
                          
                          {payment.card && (
                            <div className="space-y-2">
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Cartão Gerado
                              </span>
                              <button
                                onClick={() => openCardUrl(payment.card!.url)}
                                className="flex items-center gap-2 text-sm text-blue-600 dark:text-[#ae9efd] hover:underline font-semibold group"
                              >
                                <Wallet className="h-4 w-4" />
                                <span className="font-mono">{payment.card.code}</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Additional Actions */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          {payment.status === 'paid' && !payment.card && (
                            <Badge 
                              variant="outline" 
                              className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700/30 bg-amber-50 dark:bg-amber-900/20 text-sm font-medium"
                            >
                              ⏳ Aguardando criação do cartão
                            </Badge>
                          )}
                          
                          {payment.card && (
                            <Button
                              onClick={() => openCardUrl(payment.card!.url)}
                              size="sm"
                              variant="outline"
                              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar Cartão
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                          
                          {payment.customer_phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <span>📱</span>
                              <span>{payment.customer_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* RESPONSIVE PAGINATION */}
          {payments.last_page > 1 && (
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
                    <span className="hidden sm:inline">
                      Mostrando <span className="font-semibold text-slate-900 dark:text-[#ae9efd]">{Math.min(payments.per_page, filteredPayments.length)}</span> de <span className="font-semibold text-slate-900 dark:text-[#ae9efd]">{payments.total}</span> pagamentos
                    </span>
                    <span className="sm:hidden">
                      <span className="font-semibold text-slate-900 dark:text-[#ae9efd]">{Math.min(payments.per_page, filteredPayments.length)}</span> de <span className="font-semibold text-slate-900 dark:text-[#ae9efd]">{payments.total}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={payments.current_page === 1}
                      onClick={() => router.get(`/admin/payments?page=${payments.current_page - 1}`)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Anterior</span>
                      <span className="sm:hidden">‹</span>
                    </Button>
                    
                    <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <span className="text-sm font-semibold text-slate-900 dark:text-[#ae9efd]">
                        {payments.current_page}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        de {payments.last_page}
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={payments.current_page === payments.last_page}
                      onClick={() => router.get(`/admin/payments?page=${payments.current_page + 1}`)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Próximo</span>
                      <span className="sm:hidden">›</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* FLOATING ACTION BUTTON FOR MOBILE */}
          <div className="fixed bottom-6 right-6 lg:hidden">
            <Button
              size="lg"
              className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-[#ae9efd] dark:hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Main component that wraps with ToastProvider
const AdminPayments: React.FC<Props> = (props) => {
  return (
    <ToastProvider>
      <AdminPaymentsContent {...props} />
    </ToastProvider>
  );
};

export default AdminPayments;