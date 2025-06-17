import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layouts';
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  Eye, 
  Mail, 
  Phone, 
  Clock, 
  User,
  Building2,
  MapPin,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface CardRequest {
  id: number;
  name: string;
  job_title?: string;
  company?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  status: 'pending' | 'processed' | 'activated' | 'expired';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  display_name: string;
  primary_contact: string;
  is_complete: boolean;
  card?: {
    id: number;
    code: string;
    unique_slug: string;
    status: string;
  };
}

interface Props {
  requests: CardRequest[];
  stats: {
    today: number;
    week: number;
    month: number;
    total: number;
    pending: number;
    activated: number;
  };
}

export default function AdminRequests({ requests, stats }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (req.company && req.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    // Date filtering logic would go here
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'activated': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '🟡';
      case 'processed': return '🔵';
      case 'activated': return '🟢';
      case 'expired': return '🔴';
      default: return '⚪';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const handleBulkAction = (action: string) => {
    if (selectedRequests.length === 0) return;
    
    switch (action) {
      case 'activate':
        // Bulk activate logic
        break;
      case 'email':
        // Bulk email logic
        break;
      case 'export':
        // Bulk export logic
        break;
    }
  };

  return (
    <AdminLayout>
      <Head title="Solicitações de Cartões" />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📥 Solicitações de Cartões</h1>
            <p className="text-gray-600 mt-1">Gerencie todas as solicitações de cartões digitais</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.today || 0}</div>
            <div className="text-sm text-gray-600">Hoje</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats?.week || 0}</div>
            <div className="text-sm text-gray-600">Esta Semana</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats?.month || 0}</div>
            <div className="text-sm text-gray-600">Este Mês</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats?.total || 0}</div>
            <div className="text-sm text-gray-600">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats?.activated || 0}</div>
            <div className="text-sm text-gray-600">Ativados</div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processed">Processado</SelectItem>
                <SelectItem value="activated">Ativado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedRequests.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedRequests.length} solicitação(ões) selecionada(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ativar em Lote
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">📭</div>
            <p className="text-gray-600">Nenhuma solicitação encontrada</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Aguardando novas solicitações'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    {/* Left Section - Main Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                        checked={selectedRequests.includes(req.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRequests([...selectedRequests, req.id]);
                          } else {
                            setSelectedRequests(selectedRequests.filter(id => id !== req.id));
                          }
                        }}
                      />
                      
                      {/* Request Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {req.name}
                          </h3>
                          <span className="text-sm text-gray-500">#{req.id}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          {req.job_title && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="truncate">{req.job_title}</span>
                            </div>
                          )}
                          
                          {req.company && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate">{req.company}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{req.email || 'Sem email'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(req.created_at)}</span>
                          </div>
                        </div>

                        {/* Card Info if exists */}
                        {req.card && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <span className="font-medium">Cartão criado:</span>
                            <span className="ml-2">capinhadigital.com.br/c/{req.card.code}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Status and Actions */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                        <span className="mr-1">{getStatusIcon(req.status)}</span>
                        {req.status === 'pending' && 'Pendente'}
                        {req.status === 'processed' && 'Processado'}
                        {req.status === 'activated' && 'Ativado'}
                        {req.status === 'expired' && 'Expirado'}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.get(`/admin/requests/${req.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {req.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => router.get(`/cards/create?request_id=${req.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Criar Cartão
                          </Button>
                        )}

                        {req.status === 'activated' && req.card && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/c/${req.card.code}`, '_blank')}
                          >
                            Ver Cartão
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination could go here */}
        {filteredRequests.length > 20 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {Math.min(20, filteredRequests.length)} de {filteredRequests.length} solicitações
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Anterior</Button>
                <Button size="sm" variant="outline">Próximo</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}