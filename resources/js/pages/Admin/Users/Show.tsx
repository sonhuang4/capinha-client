import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { ArrowLeft, User, Mail, Shield, Calendar, Eye, MousePointer, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string): React.ReactElement => {
        return (
            <Badge variant={status === 'activated' ? 'outline' : 'secondary'}>
                {status === 'activated' ? 'Active' : 'Pending'}
            </Badge>
        );
    };

    const handleBackClick = (): void => {
        router.get('/admin/users');
    };

    return (
        <>
            <Head title={`User: ${user.name}`} />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBackClick}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Users
                    </Button>
                    
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>
                                {/* <AvatarInitials name={user.name} /> */}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                                {user.role}
                            </Badge>
                            <Badge variant={user.is_active ? 'outline' : 'secondary'}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* User Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_cards}</div>
                            <div className="text-sm text-muted-foreground">
                                {stats.active_cards} active, {stats.pending_cards} pending
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_views}</div>
                            <div className="text-sm text-muted-foreground">
                                {stats.avg_views_per_card} avg per card
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {formatDate(user.created_at).split(',')[0]}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Viewed Card</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {stats.most_viewed_card ? (
                                <>
                                    <div className="text-lg font-bold">{stats.most_viewed_card.click_count} views</div>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {stats.most_viewed_card.name}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">No cards yet</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* User Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-sm">{user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <p className="text-sm">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                                    <p className="text-sm">{user.role}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                                    <p className="text-sm">{user.is_active ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                    <p className="text-sm">{formatDate(user.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                    <p className="text-sm">{formatDate(user.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User's Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle>User's Cards ({user.cards.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.cards.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Card Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Views</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.cards.map((card: UserCard) => (
                                        <TableRow key={card.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{card.name}</div>
                                                    {card.email && (
                                                        <div className="text-sm text-muted-foreground">{card.email}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(card.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{card.click_count || 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                                    {card.unique_slug || card.code}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatDate(card.created_at).split(',')[0]}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Cards Created</h3>
                                <p className="text-muted-foreground">This user hasn't created any cards yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default UserShow;