import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Search, Filter, Download, Users, UserCheck, UserX, Shield, Calendar, Eye, Trash2, Edit, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/admin-layouts';

// Type definitions
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client' | string;
  is_active: boolean;
  cards_count: number;
  total_card_views: number;
  created_at: string;
  updated_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedUsers {
  data: User[];
  total: number;
  from: number;
  to: number;
  links: PaginationLink[];
}

interface Stats {
  total_users: number;
  active_users: number;
  admin_users: number;
  users_this_month: number;
}

interface Filters {
  search?: string;
  role?: string;
  status?: string;
  cards_count?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: string;
  per_page?: number;
}

interface PageProps extends InertiaPageProps {
  users: PaginatedUsers;
  stats: Stats;
  filters: Filters;
}

interface FilterParams {
  search?: string;
  role?: string;
  status?: string;
  cards_count?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: string;
  per_page?: number;
}

const UsersIndex: React.FC = () => {
  const { users, stats, filters } = usePage<PageProps>().props;

  // State management
  const [searchTerm, setSearchTerm] = useState<string>(filters.search || '');
  const [selectedRole, setSelectedRole] = useState<string>(filters.role || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'all');
  const [selectedCardsCount, setSelectedCardsCount] = useState<string>(filters.cards_count || 'all');
  const [dateFrom, setDateFrom] = useState<string>(filters.date_from || '');
  const [dateTo, setDateTo] = useState<string>(filters.date_to || '');
  const [sortBy, setSortBy] = useState<string>(filters.sort_by || 'created_at');
  const [sortOrder, setSortOrder] = useState<string>(filters.sort_order || 'desc');
  const [perPage, setPerPage] = useState<number>(filters.per_page || 15);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState<boolean>(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const csrfToken: string = `document.querySelector('meta[name="csrf-token"]').getAttribute('content')`;

  // Apply filters
  const applyFilters = (): void => {
    const params: Record<string, string | number> = {
      search: searchTerm,
      role: selectedRole,
      status: selectedStatus,
      cards_count: selectedCardsCount,
      date_from: dateFrom,
      date_to: dateTo,
      sort_by: sortBy,
      sort_order: sortOrder,
      per_page: perPage,
    };

    // Remove empty values
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (!value || value === 'all' || value === '') {
        delete params[key];
      }
    });

    router.get('/admin/users', params, { preserveState: true });
  };

  // Clear filters
  const clearFilters = (): void => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setSelectedCardsCount('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPerPage(15);

    router.get('/admin/users', {}, { preserveState: true });
  };

  // Handle user status toggle
  const toggleUserStatus = (user: User): void => {
    try {
      router.post(`/admin/users/${user.id}/status`,
        {
          is_active: !user.is_active
        });
    } catch (err) {
      alert("A operação de alteração falhou.")
    }
  };

  // Handle user role update
  const updateUserRole = (user: User, newRole: string): void => {
    try {
      router.post(`/admin/users/${user.id}/role`, {
        role: newRole
      });
    } catch (err) {
      alert("A operação de alteração falhou.")
    }
  };

  // Handle single user deletion
  const handleDeleteUser = async (): Promise<void> => {
    console.log(userToDelete);
    if (!userToDelete) return;

    const res = router.delete(`/admin/users/${userToDelete.id}`);
    console.log("response data =>", res);
  };

  // Handle bulk actions
  const handleBulkAction = (): void => {
    if (selectedUsers.length === 0 || !bulkAction) return;

    router.post('/admin/users/bulk-action', {
      action: bulkAction,
      user_ids: selectedUsers
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Ação em lote concluída com sucesso');
        setSelectedUsers([]);
        setShowBulkDialog(false);
        setBulkAction('');
      },
      onError: () => {
        toast.error('Falha ao executar ação em lote');
      }
    });
  };

  // Handle export
  const handleExport = (): void => {
    const params = new URLSearchParams({
      search: searchTerm,
      role: selectedRole,
      status: selectedStatus,
      cards_count: selectedCardsCount,
      date_from: dateFrom,
      date_to: dateTo,
    });

    window.open(`/admin/users/export/csv?${params.toString()}`, '_blank');
  };

  // Handle select all users
  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      setSelectedUsers(users.data.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle individual user selection
  const handleSelectUser = (userId: number, checked: boolean): void => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean): React.ReactElement => {
    return (
      <Badge variant={isActive ? 'outline' : 'secondary'} className={isActive ? 'border-green-500 text-green-700 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
        {isActive ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  // Get role badge
  const getRoleBadge = (role: string): React.ReactElement => {
    return (
      <Badge variant={role === 'admin' ? 'destructive' : 'outline'} className={role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}>
        {role === 'admin' ? 'Admin' : 'Cliente'}
      </Badge>
    );
  };

  // Handle per page change
  const handlePerPageChange = (value: string): void => {
    setPerPage(parseInt(value, 10));
  };

  // Handle pagination link click
  const handlePaginationClick = (url: string): void => {
    router.get(url);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        applyFilters();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <AdminLayout>
      <Head title="Gerenciamento de Usuários" />

      <div className="min-h-screen bg-slate-50 dark:bg-[#020818] transition-colors duration-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-[#ae9efd] dark:to-blue-400 text-transparent bg-clip-text">
                Gerenciamento de Usuários
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Gerencie todos os usuários e suas permissões
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {selectedUsers.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDialog(true)}
                  className="w-full sm:w-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Ações em Lote ({selectedUsers.length})
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#ae9efd]">{stats.total_users}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Usuários Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.active_users}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Administradores</CardTitle>
                <Shield className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admin_users}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Este Mês</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.users_this_month}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-[#ae9efd]">
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filtros</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-slate-600 dark:text-slate-400"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
                {/* Search */}
                <div className="relative md:col-span-2 xl:col-span-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </div>

                {/* Role Filter */}
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectItem value="all">Todas as Funções</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                {/* Cards Count Filter */}
                <Select value={selectedCardsCount} onValueChange={setSelectedCardsCount}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Cartões" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                    <SelectItem value="all">Todos os Usuários</SelectItem>
                    <SelectItem value="none">Sem Cartões</SelectItem>
                    <SelectItem value="has_cards">Com Cartões</SelectItem>
                    <SelectItem value="multiple">Múltiplos Cartões</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date From */}
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Data Inicial"
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />

                {/* Date To */}
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="Data Final"
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={applyFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Aplicar Filtros
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Limpar Tudo
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Mostrar:</span>
                  <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                    <SelectTrigger className="w-20 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-[#ae9efd]">Usuários ({users.total})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile Cards View */}
              <div className="lg:hidden space-y-4">
                {users.data.map((user: User) => (
                  <div key={user.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <DropdownMenuItem onClick={() => router.get(`/admin/users/${user.id}`)} className="text-slate-700 dark:text-slate-300">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleUserStatus(user)}
                            className={user.is_active ? 'text-red-600' : 'text-green-600'}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateUserRole(user, user.role === 'admin' ? 'client' : 'admin')}
                            className="text-slate-700 dark:text-slate-300"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Tornar {user.role === 'admin' ? 'Cliente' : 'Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Função:</span>
                        <div className="mt-1">{getRoleBadge(user.role)}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Status:</span>
                        <div className="mt-1">{getStatusBadge(user.is_active)}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Cartões:</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{user.cards_count}</span>
                          {user.cards_count > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.get(`/admin/users/${user.id}`)}
                              className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Visualizações:</span>
                        <div className="mt-1 font-medium text-slate-900 dark:text-slate-100">{user.total_card_views || 0}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Criado em: {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === users.data.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Usuário</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Função</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Cartões</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Total de Visualizações</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Criado</TableHead>
                      <TableHead className="w-12 text-slate-600 dark:text-slate-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.map((user: User) => (
                      <TableRow key={user.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.is_active)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{user.cards_count}</span>
                            {user.cards_count > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.get(`/admin/users/${user.id}`)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{user.total_card_views || 0}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                              <DropdownMenuItem onClick={() => router.get(`/admin/users/${user.id}`)} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleUserStatus(user)}
                                className={user.is_active ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}
                              >
                                {user.is_active ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateUserRole(user, user.role === 'admin' ? 'client' : 'admin')}
                                className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Tornar {user.role === 'admin' ? 'Cliente' : 'Admin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {users.links && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
                    Mostrando {users.from} até {users.to} de {users.total} resultados
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {users.links.map((link: PaginationLink, index: number) => (
                      <Button
                        key={index}
                        variant={link.active ? "default" : "outline"}
                        size="sm"
                        disabled={!link.url}
                        onClick={() => link.url && handlePaginationClick(link.url)}
                        className={`min-w-[40px] ${
                          link.active 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800' 
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-[#ae9efd]">Excluir Usuário</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Tem certeza de que deseja excluir <strong className="text-slate-900 dark:text-slate-100">{userToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            >
              Excluir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-[#ae9efd]">Ação em Lote</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Selecione uma ação para executar em {selectedUsers.length} usuários selecionados.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                <SelectValue placeholder="Selecione uma ação..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectItem value="activate">Ativar Usuários</SelectItem>
                <SelectItem value="deactivate">Desativar Usuários</SelectItem>
                <SelectItem value="delete">Excluir Usuários</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBulkDialog(false)}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className={`w-full sm:w-auto ${
                bulkAction === 'delete' 
                  ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
              }`}
            >
              Executar Ação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersIndex;