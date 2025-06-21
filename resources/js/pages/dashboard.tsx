import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { mockCards, BusinessCard } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Delete, Eye, Copy, MessageCircle, Mail, Share2, Check, Menu, X, Filter } from 'lucide-react';
import BusinessCardDisplay from '@/components/BusinessCardDisplay';
import CardForm from '@/components/CardForm';
import AdminLayout from '@/layouts/admin-layouts';
import { Head, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SharingOptions {
    short_link: string;
    whatsapp: {
        url: string;
        message: string;
    };
    email: {
        url: string;
        subject: string;
        body: string;
    };
    sms: {
        url: string;
        message: string;
    };
    social: {
        twitter: string;
        linkedin: string;
        facebook: string;
    };
}

// Extended BusinessCard interface to ensure email field
interface ExtendedBusinessCard extends BusinessCard {
    email?: string;
    clickCount?: number;
}

const AdminDashboard = () => {
    const [cards, setCards] = useState<ExtendedBusinessCard[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCard, setSelectedCard] = useState<ExtendedBusinessCard | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<'all' | 'activated' | 'pending'>('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/cards');
            setCards(response.data);
        } catch (error: any) {
            console.error('Erro ao carregar cartões:', error);
            alert('Erro ao carregar cartões: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const filteredCards = cards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(card.id).includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleCardStatus = async (cardId: string) => {
        try {
            const response = await axios.put(`/cards/${cardId}/toggle-status`);
            const updatedCard = response.data;
            setCards(prev =>
                prev.map(card =>
                    card.id === cardId ? { ...card, status: updatedCard.status } : card
                )
            );
        } catch (error: any) {
            console.error('Falha ao alternar o status do cartão:', error);
            alert('Erro ao alterar status: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteCard = async (card: ExtendedBusinessCard) => {
        if (!confirm(`⚠️ Confirmação de Exclusão\n\nTem certeza que deseja deletar o cartão de "${card.name}"?\n\nEsta ação não pode ser desfeita e o cartão será permanentemente removido.`)) {
            return;
        }

        try {
            await axios.delete(`/cards/${card.id}`);

            // Remove card from local state
            setCards(prev => prev.filter(c => c.id !== card.id));

            alert('Sucesso!\n\nCartão deletado com sucesso!');
        } catch (error: any) {
            console.error('Failed to delete card:', error);

            if (error.response?.status === 403) {
                alert('Erro!\n\nVocê não tem permissão para deletar este cartão.');
            } else if (error.response?.status === 404) {
                alert('Erro!\n\nCartão não encontrado.');
            } else {
                alert('Erro!\n\nNão foi possível deletar o cartão. Tente novamente.');
            }
        }
    };

    const handleSaveCard = async (cardData: Partial<ExtendedBusinessCard>) => {
        try {
            const response = selectedCard
                ? await axios.put(`/cards/${selectedCard.id}`, cardData)
                : await axios.post('/cards', cardData);

            const updatedCard = response.data;

            setCards((prev) =>
                selectedCard
                    ? prev.map((c) => (c.id === selectedCard.id ? updatedCard : c))
                    : [...prev, updatedCard]
            );

            setIsFormOpen(false);
            setSelectedCard(null);
        } catch (error: any) {
            console.error('Falha ao salvar o cartão:', error);

            // Log the validation errors
            if (error.response && error.response.data) {
                console.error('Erros de validação:', error.response.data);
                alert('Erro de validação: ' + JSON.stringify(error.response.data));
            }
        }
    };

    const handlePreview = (card: ExtendedBusinessCard) => {
        setSelectedCard(card);
        setIsPreviewOpen(true);
    };

    // Copy short link to clipboard
    const copyShortLink = async (card: ExtendedBusinessCard) => {
        try {
            const response = await axios.get(`/cards/${card.id}/short-link`);
            
            if (response.data.success) {
                const { short_link } = response.data;

                await navigator.clipboard.writeText(short_link);

                // Show visual feedback
                setCopiedLinks(prev => new Set([...prev, card.id]));
                setTimeout(() => {
                    setCopiedLinks(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(card.id);
                        return newSet;
                    });
                }, 2000);

                alert("Link copiado! Link curto copiado para a área de transferência");
            } else {
                throw new Error(response.data.message || 'Failed to get short link');
            }
        } catch (error: any) {
            console.error('Falha ao copiar link curto:', error);
            alert("Falha ao copiar link curto: " + (error.response?.data?.message || error.message));
        }
    };

    // Share on WhatsApp with fallback
    const shareOnWhatsApp = async (card: ExtendedBusinessCard) => {
        try {
            console.log('Calling:', `/cards/${card.id}/whatsapp-share`);

            const response = await axios.get(`/cards/${card.id}/whatsapp-share`);
            
            if (response.data.success) {
                const { whatsapp_url, fallback_message } = response.data;

                console.log('Got WhatsApp URL:', whatsapp_url);

                // Try to open WhatsApp
                const newWindow = window.open(whatsapp_url, '_blank');

                // If window didn't open (blocked), use fallback
                setTimeout(() => {
                    if (!newWindow || newWindow.closed) {
                        // Copy message to clipboard as fallback
                        navigator.clipboard.writeText(fallback_message).then(() => {
                            alert("Link do WhatsApp bloqueado. Mensagem copiada para a área de transferência! Cole-a manualmente no WhatsApp.");
                        }).catch(() => {
                            alert(`Link do WhatsApp bloqueado. Mensagem copiada para a área de transferência! Cole-a manualmente no WhatsApp.\n\n${fallback_message}`);
                        });
                    }
                }, 1000);
            } else {
                throw new Error(response.data.message || 'Failed to get WhatsApp share');
            }

        } catch (error: any) {
            console.error('Falha ao obter o link do WhatsApp:', error);
            alert("Erro: Falha ao gerar link do WhatsApp - " + (error.response?.data?.message || error.message));
        }
    };

    // Share via Email
    const shareViaEmail = async (card: ExtendedBusinessCard) => {
        try {
            const response = await axios.get(`/cards/${card.id}/email-share`);
            
            if (response.data.success) {
                const { subject, body } = response.data;

                // Create email content for copying
                const emailContent = "Subject: " + subject + "\n\nTo: [Enter recipient email]\n\n" + body;

                // Try to copy to clipboard
                navigator.clipboard.writeText(emailContent).then(() => {
                    alert("Conteúdo do e-mail copiado para a área de transferência!\n\nAgora você pode:\n1. Abrir o Gmail/Yahoo/Outlook\n2. Colar o conteúdo\n3. Adicionar o e-mail do destinatário\n4. Enviar!");
                }).catch(() => {
                    // Fallback if clipboard doesn't work
                    prompt("Copie este conteúdo de e-mail manualmente:", emailContent);
                });
            } else {
                throw new Error(response.data.message || 'Failed to get email share');
            }

        } catch (error: any) {
            console.error('Falha ao obter dados de e-mail:', error);
            alert("Erro: Falha ao gerar conteúdo de e-mail - " + (error.response?.data?.message || error.message));
        }
    };

    // Send email directly to card owner
    const sendEmailToUser = async (card: ExtendedBusinessCard) => {
        if (!card.email) {
            alert("⚠️ Este cartão não possui endereço de e-mail. Adicione um e-mail primeiro.");
            return;
        }

        if (!confirm("Enviar email de ativação para: " + card.email + "?")) {
            return;
        }

        try {
            const response = await axios.get(`/cards/${card.id}/send-email`);

            if (response.data.success) {
                alert("✅ E-mail enviado com sucesso para: " + response.data.recipient);
            } else {
                alert("❌ Falha: " + response.data.message);
            }

        } catch (error: any) {
            console.error('Erro ao enviar e-mail:', error);
            alert("❌ Falha ao enviar o e-mail: " + (error.response?.data?.message || error.message));
        }
    };

    // Get all sharing options
    const getSharingOptions = async (card: ExtendedBusinessCard): Promise<SharingOptions | null> => {
        try {
            const response = await axios.get(`/cards/${card.id}/sharing-options`);
            
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to get sharing options');
            }
        } catch (error: any) {
            console.error('Falha ao obter opções de compartilhamento:', error);
            alert("Erro ao obter opções de compartilhamento: " + (error.response?.data?.message || error.message));
            return null;
        }
    };

    // Handle social media sharing
    const handleSocialShare = async (card: ExtendedBusinessCard, platform: string) => {
        const options = await getSharingOptions(card);
        if (!options) return;

        let url = '';
        switch (platform) {
            case 'twitter':
                url = options.social.twitter;
                break;
            case 'linkedin':
                url = options.social.linkedin;
                break;
            case 'facebook':
                url = options.social.facebook;
                break;
            case 'sms':
                url = options.sms.url;
                break;
        }

        if (url) {
            window.open(url, '_blank');
        }
    };

    const activatedCount = cards.filter(card => card.status === 'activated').length;
    const pendingCount = cards.filter(card => card.status === 'pending').length;

    return (
        <AdminLayout>
            <div className="min-h-screen relative">
                {/* Background */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
                </div>

                {/* Main Content */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Gestão de Cartões de Visita
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Crie e gerencie cartões de visita digitais
                            </p>

                            {/* Stats Row - Mobile First */}
                            <div className="flex flex-wrap gap-2 sm:gap-4 pt-2">
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Total:</span>
                                    <Badge variant="outline" className="text-xs">{cards.length}</Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Ativo:</span>
                                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">{activatedCount}</Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Pendente:</span>
                                    <Badge variant="secondary" className="text-xs">{pendingCount}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Create Button */}
                        <Button
                            className="w-full sm:w-auto gradient-button"
                            onClick={() => router.visit('/client/dashboard')}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="sm:inline">Criar cartão</span>
                        </Button>
                    </div>

                    {/* Search and Filter Section */}
                    <Card className="material-card p-4 sm:p-6 animate-fade-in">
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search by name or card ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('all')}
                                    className="text-xs sm:text-sm"
                                >
                                    Todos os cartões
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'activated' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('activated')}
                                    className="text-xs sm:text-sm"
                                >
                                    Ativo ({activatedCount})
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('pending')}
                                    className="text-xs sm:text-sm"
                                >
                                    Pendente ({pendingCount})
                                </Button>

                                {/* Results Count */}
                                <div className="ml-auto flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                    <span>Showing:</span>
                                    <Badge variant="outline" className="text-xs">{filteredCards.length}</Badge>
                                </div>
                            </div>

                            {/* Refresh Button */}
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadCards}
                                    disabled={loading}
                                    className="text-xs"
                                >
                                    {loading ? 'Carregando...' : 'Atualizar'}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Cards Display */}
                    <Card className="material-card p-4 sm:p-6 animate-fade-in">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <div className="space-y-2">
                                    <p className="text-lg font-medium">Carregando cartões...</p>
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                </div>
                            </div>
                        ) : filteredCards.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                {searchTerm || statusFilter !== 'all' ? (
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">Nenhum cartão encontrado</p>
                                        <p className="text-sm">
                                            {searchTerm && `Nenhum cartão corresponde a "${searchTerm}". `}
                                            {statusFilter !== 'all' && `Nenhum cartão ${statusFilter} encontrado. `}
                                            Tente ajustar sua pesquisa ou filtro.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                            }}
                                            className="mt-4"
                                        >
                                            Limpar Filtros
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">Nenhum cartão ainda</p>
                                        <p className="text-sm">Crie seu primeiro cartão de visita digital para começar.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredCards.map((card) => (
                                    <div key={card.id} className="group relative">
                                        <div className={`relative rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${card.status === 'activated'
                                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200/60 dark:border-emerald-700/50'
                                            : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200/60 dark:border-amber-700/50'
                                            }`}>

                                            {/* Smart Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                                                            {card.name}
                                                        </h3>
                                                        <div className={`w-2 h-2 rounded-full ${card.status === 'activated' ? 'bg-emerald-500' : 'bg-amber-500'
                                                            }`}></div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                            <span className="font-mono bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded-md">
                                                                #{card.id}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                                                {card.clickCount || 0} clicks
                                                            </span>
                                                        </div>

                                                        {card.email && (
                                                            <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                                                {card.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Switch
                                                    checked={card.status === 'activated'}
                                                    onCheckedChange={() => toggleCardStatus(card.id)}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-amber-400"
                                                />
                                            </div>

                                            {/* Smart Action Grid */}
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        onClick={() => handleDeleteCard(card)}
                                                        className="flex items-center justify-center p-2.5 text-xs font-medium rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all border border-white/50 dark:border-gray-700/50"
                                                        title="Deletar Cartão"
                                                    >
                                                        <Delete className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handlePreview(card)}
                                                        className="flex items-center justify-center p-2.5 text-xs font-medium rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all border border-white/50 dark:border-gray-700/50"
                                                        title="Visualizar Cartão"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => copyShortLink(card)}
                                                        className={`flex items-center justify-center p-2.5 text-xs font-medium rounded-lg transition-all border ${copiedLinks.has(card.id)
                                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600"
                                                            : "bg-white/70 dark:bg-gray-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 border-white/50 dark:border-gray-700/50"
                                                            }`}
                                                        title={copiedLinks.has(card.id) ? "Link Copiado!" : "Copiar Link"}
                                                    >
                                                        {copiedLinks.has(card.id) ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.visit(`/admin/cards/${card.id}/activations`)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto font-normal justify-start"
                                                >
                                                    📊 Ver Ativações
                                                </Button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => shareOnWhatsApp(card)}
                                                        className="flex-1 flex items-center justify-center p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 shadow-sm hover:shadow-md transition-all border border-white/50 dark:border-gray-700/50"
                                                        title="Compartilhar no WhatsApp"
                                                    >
                                                        <MessageCircle className="w-5 h-5" />
                                                    </button>

                                                    <button
                                                        onClick={() => shareViaEmail(card)}
                                                        className="flex-1 flex items-center justify-center p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-sm hover:shadow-md transition-all border border-white/50 dark:border-gray-700/50"
                                                        title="Compartilhar via Email"
                                                    >
                                                        <Mail className="w-5 h-5" />
                                                    </button>

                                                    {card.email ? (
                                                        <button
                                                            onClick={() => sendEmailToUser(card)}
                                                            className="flex-1 flex items-center justify-center p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 shadow-sm hover:shadow-md transition-all border border-white/50 dark:border-gray-700/50"
                                                            title={`Enviar email de ativação para ${card.email}`}
                                                        >
                                                            <Mail className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    className="flex-1 flex items-center justify-center p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/30 shadow-sm hover:shadow-md transition-all border border-white/50 dark:border-gray-700/50"
                                                                    title="Mais opções de compartilhamento"
                                                                >
                                                                    <Share2 className="w-5 h-5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-36">
                                                                <DropdownMenuItem onClick={() => handleSocialShare(card, 'twitter')}>
                                                                    <span className="mr-2">🐦</span>Twitter
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleSocialShare(card, 'linkedin')}>
                                                                    <span className="mr-2">💼</span>LinkedIn
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleSocialShare(card, 'facebook')}>
                                                                    <span className="mr-2">📘</span>Facebook
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleSocialShare(card, 'sms')}>
                                                                    <span className="mr-2">💬</span>SMS
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Preview Dialog */}
                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                                <DialogTitle>Visualização do Cartão</DialogTitle>
                            </DialogHeader>
                            {selectedCard && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <h3 className="font-bold text-lg mb-2">{selectedCard.name}</h3>
                                        {selectedCard.email && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                📧 {selectedCard.email}
                                            </p>
                                        )}
                                        {selectedCard.phone && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                📱 {selectedCard.phone}
                                            </p>
                                        )}
                                        {selectedCard.whatsapp && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                💬 {selectedCard.whatsapp}
                                            </p>
                                        )}
                                        {selectedCard.company && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                🏢 {selectedCard.company}
                                            </p>
                                        )}
                                        {selectedCard.job_title && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                💼 {selectedCard.job_title}
                                            </p>
                                        )}
                                        {selectedCard.website && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                🌐 {selectedCard.website}
                                            </p>
                                        )}
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500">
                                                Status: <span className={selectedCard.status === 'activated' ? 'text-green-600' : 'text-amber-600'}>
                                                    {selectedCard.status === 'activated' ? 'Ativo' : 'Pendente'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Clicks: {selectedCard.clickCount || 0}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Código: {selectedCard.code}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;