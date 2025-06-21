import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { ArrowLeft, User, Mail, Shield, Calendar, Eye, MousePointer, TrendingUp, Activity, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AdminLayout from '@/layouts/admin-layouts';

// Type definitions
interface UserCard {
    id: number;
    name: string;
    email?: string;
    status: 'activated' | 'pending';
    click_count: number;
    unique_slug?: string;
    code: string;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    cards: UserCard[];
}

interface MostViewedCard {
    click_count: number;
    name: string;
}

interface Stats {
    total_cards: number;
    active_cards: number;
    pending_cards: number;
    total_views: number;
    avg_views_per_card: number;
    most_viewed_card: MostViewedCard | null;
}

interface PageProps extends InertiaPageProps {
    user: User;
    stats: Stats;
}

const UserShow: React.FC = () => {
    const { user, stats } = usePage<PageProps>().props;

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString: string | null): string => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string): React.ReactElement => {
        return (
            <Badge 
                variant={status === 'activated' ? 'outline' : 'secondary'}
                className={status === 'activated' 
                    ? 'border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                }
            >
                {status === 'activated' ? (
                    <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                    </>
                ) : (
                    <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                    </>
                )}
            </Badge>
        );
    };

    const getRoleBadge = (role: string): React.ReactElement => {
        return (
            <Badge 
                variant={role === 'admin' ? 'destructive' : 'outline'}
                className={role === 'admin' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' 
                    : 'border-blue-500 text-blue-700 dark:text-blue-400'
                }
            >
                <Shield className="w-3 h-3 mr-1" />
                {role === 'admin' ? 'Administrador' : 'Usuário'}
            </Badge>
        );
    };

    const getAccountBadge = (isActive: boolean): React.ReactElement => {
        return (
            <Badge 
                variant={isActive ? 'outline' : 'secondary'}
                className={isActive 
                    ? 'border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }
            >
                {isActive ? (
                    <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                    </>
                ) : (
                    <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Inativo
                    </>
                )}
            </Badge>
        );
    };

    const getUserInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getDaysAgo = (dateString: string): number => {
        return Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    };

    const handleBackClick = (): void => {
        router.get('/admin/users');
    };

    return (
        <AdminLayout>
            <Head title={`Usuário: ${user.name}`} />
            
            <div className="min-h-screen bg-slate-50 dark:bg-[#020818] transition-colors duration-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
                    
                    {/* RESPONSIVE HEADER */}
                    <div className="space-y-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleBackClick}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Voltar aos Usuários</span>
                            <span className="sm:hidden">Voltar</span>
                        </Button>
                        
                        {/* USER PROFILE HEADER */}
                        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg sm:text-xl font-bold">
                                            {getUserInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 text-center sm:text-left space-y-2">
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-[#ae9efd]">
                                            {user.name}
                                        </h1>
                                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                            {user.email}
                                        </p>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                            {getRoleBadge(user.role)}
                                            {getAccountBadge(user.is_active)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RESPONSIVE STATS GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {/* Total Cards */}
                        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="hidden sm:inline">Total de Cartões</span>
                                    <span className="sm:hidden">Cartões</span>
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#ae9efd]">
                                    {stats.total_cards}
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-tight">
                                    <span className="text-green-600 dark:text-green-400">{stats.active_cards}</span> ativo
                                    {stats.active_cards !== 1 ? 's' : ''}, <span className="text-amber-600 dark:text-amber-400">{stats.pending_cards}</span> pendente
                                    {stats.pending_cards !== 1 ? 's' : ''}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Total Views */}
                        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="hidden sm:inline">Total de Visualizações</span>
                                    <span className="sm:hidden">Views</span>
                                </CardTitle>
                                <Eye className="h-4 w-4 text-green-500 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#ae9efd]">
                                    {stats.total_views}
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                    <span className="hidden sm:inline">{stats.avg_views_per_card} média por cartão</span>
                                    <span className="sm:hidden">{stats.avg_views_per_card} avg/cartão</span>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Member Since */}
                        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="hidden sm:inline">Membro desde</span>
                                    <span className="sm:hidden">Membro</span>
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#ae9efd]">
                                    <span className="hidden sm:inline">{formatDate(user.created_at).split(',')[0]}</span>
                                    <span className="sm:hidden">{formatDateShort(user.created_at)}</span>
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                    {getDaysAgo(user.created_at)} dias atrás
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Most Viewed Card */}
                        <Card className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="hidden sm:inline">Cartão Mais Visto</span>
                                    <span className="sm:hidden">Top Cartão</span>
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                            </CardHeader>
                            <CardContent>
                                {stats.most_viewed_card ? (
                                    <>
                                        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#ae9efd]">
                                            {stats.most_viewed_card.click_count} visualizações
                                        </div>
                                        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                            {stats.most_viewed_card.name}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-slate-500 dark:text-slate-500">
                                        Nenhum cartão ainda
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* USER DETAILS CARD */}
                    <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-[#ae9efd] flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informações do Usuário
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nome Completo</label>
                                        <p className="text-sm sm:text-base text-slate-900 dark:text-[#ae9efd] font-medium mt-1">{user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Endereço de Email</label>
                                        <p className="text-sm sm:text-base text-slate-900 dark:text-[#ae9efd] font-medium mt-1 break-all">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Função</label>
                                        <div className="mt-1">
                                            {getRoleBadge(user.role)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Status da Conta</label>
                                        <div className="mt-1">
                                            {getAccountBadge(user.is_active)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Criado em</label>
                                        <p className="text-sm sm:text-base text-slate-900 dark:text-[#ae9efd] font-medium mt-1">{formatDate(user.created_at)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Última Atualização</label>
                                        <p className="text-sm sm:text-base text-slate-900 dark:text-[#ae9efd] font-medium mt-1">{formatDate(user.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* USER'S CARDS */}
                    <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-[#ae9efd] flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Cartões do Usuário ({user.cards.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.cards.length > 0 ? (
                                <>
                                    {/* MOBILE CARDS VIEW */}
                                    <div className="lg:hidden space-y-4">
                                        {user.cards.map((card: UserCard) => (
                                            <div key={card.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                                            {card.name}
                                                        </h3>
                                                        {card.email && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                                {card.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(card.status)}
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-500 dark:text-slate-400">Visualizações:</span>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Eye className="w-3 h-3 text-green-500" />
                                                            <span className="font-medium text-slate-900 dark:text-slate-100">{card.click_count || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 dark:text-slate-400">Código:</span>
                                                        <div className="mt-1">
                                                            <code className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-900 dark:text-slate-100">
                                                                {card.unique_slug || card.code}
                                                            </code>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Criado em: {formatDateShort(card.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* DESKTOP TABLE VIEW */}
                                    <div className="hidden lg:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-200 dark:border-slate-700">
                                                    <TableHead className="text-slate-600 dark:text-slate-400">Nome do Cartão</TableHead>
                                                    <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                                                    <TableHead className="text-slate-600 dark:text-slate-400">Visualizações</TableHead>
                                                    <TableHead className="text-slate-600 dark:text-slate-400">Código</TableHead>
                                                    <TableHead className="text-slate-600 dark:text-slate-400">Criado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {user.cards.map((card: UserCard) => (
                                                    <TableRow key={card.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium text-slate-900 dark:text-slate-100">{card.name}</div>
                                                                {card.email && (
                                                                    <div className="text-sm text-slate-600 dark:text-slate-400">{card.email}</div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(card.status)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Eye className="w-4 h-4 text-green-500" />
                                                                <span className="font-medium text-slate-900 dark:text-slate-100">{card.click_count || 0}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-slate-100">
                                                                {card.unique_slug || card.code}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                                {formatDateShort(card.created_at)}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                        <CreditCard className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-[#ae9efd]">
                                        Nenhum Cartão Criado
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                                        Este usuário ainda não criou nenhum cartão de visita.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UserShow;