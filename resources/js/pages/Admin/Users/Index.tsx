import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Search, Filter, Download, Users, UserCheck, UserX, Shield, Calendar, Eye, Trash2, Edit, MoreHorizontal } from 'lucide-react';
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
        toast.success('Bulk action completed successfully');
        setSelectedUsers([]);
        setShowBulkDialog(false);
        setBulkAction('');
      },
      onError: () => {
        toast.error('Failed to perform bulk action');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean): React.ReactElement => {
    return (
      <Badge variant={isActive ? 'outline' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  // Get role badge
  const getRoleBadge = (role: string): React.ReactElement => {
    return (
      <Badge variant={role === 'admin' ? 'destructive' : 'outline'}>
        {role === 'admin' ? 'Admin' : 'Client'}
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
      <Head title="User Management" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users and their permissions</p>
          </div>

          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(true)}
              >
                Bulk Actions ({selectedUsers.length})
              </Button>
            )}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.admin_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.users_this_month}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Role Filter */}
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Cards Count Filter */}
              <Select value={selectedCardsCount} onValueChange={setSelectedCardsCount}>
                <SelectTrigger>
                  <SelectValue placeholder="Cards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="none">No Cards</SelectItem>
                  <SelectItem value="has_cards">Has Cards</SelectItem>
                  <SelectItem value="multiple">Multiple Cards</SelectItem>
                </SelectContent>
              </Select>

              {/* Date From */}
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
              />

              {/* Date To */}
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button onClick={applyFilters}>Apply Filters</Button>
                <Button variant="outline" onClick={clearFilters}>Clear All</Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === users.data.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cards</TableHead>
                  <TableHead>Total Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
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
                        <span className="font-medium">{user.cards_count}</span>
                        {user.cards_count > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.get(`/admin/users/${user.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{user.total_card_views || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.get(`/admin/users/${user.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleUserStatus(user)}
                            className={user.is_active ? 'text-red-600' : 'text-green-600'}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateUserRole(user, user.role === 'admin' ? 'client' : 'admin')}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Make {user.role === 'admin' ? 'Client' : 'Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {users.links && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {users.from} to {users.to} of {users.total} results
                </div>
                <div className="flex gap-2">
                  {users.links.map((link: PaginationLink, index: number) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && handlePaginationClick(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
            <DialogDescription>
              Select an action to perform on {selectedUsers.length} selected users.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">Activate Users</SelectItem>
                <SelectItem value="deactivate">Deactivate Users</SelectItem>
                <SelectItem value="delete">Delete Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Execute Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersIndex;