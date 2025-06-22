import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { mockCards, BusinessCard } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
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

const AdminDashboardContent = () => {
    const [cards, setCards] = useState<ExtendedBusinessCard[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCard, setSelectedCard] = useState<ExtendedBusinessCard | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<'all' | 'activated' | 'pending'>('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'delete' | 'email' | null;
        card: ExtendedBusinessCard | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        type: null,
        card: null,
        isLoading: false
    });

    const { success, error, warning, info } = useToast();

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            setLoading(true);
            info('Carregando Cartões', 'Buscando cartões mais recentes...');
            
            const response = await axios.get('/cards');
            setCards(response.data);
            
            success(
                'Cartões Carregados!', 
                `${response.data.length} cartões encontrados com sucesso.`
            );
        } catch (err: any) {
            console.error('Erro ao carregar cartões:', err);
            error(
                'Erro ao Carregar Cartões',
                err.response?.data?.message || err.message || 'Não foi possível carregar os cartões. Tente novamente.'
            );
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
        const card = cards.find(c => c.id === cardId);
        const newStatus = card?.status === 'activated' ? 'pending' : 'activated';
        
        info(
            'Alterando Status', 
            `Alterando status do cartão de ${card?.name}...`
        );

        try {
            const response = await axios.put(`/cards/${cardId}/toggle-status`);
            const updatedCard = response.data;
            
            setCards(prev =>
                prev.map(card =>
                    card.id === cardId ? { ...card, status: updatedCard.status } : card
                )
            );

            success(
                'Status Alterado!',
                `Cartão de ${card?.name} agora está ${updatedCard.status === 'activated' ? 'ativo' : 'pendente'}.`
            );
        } catch (err: any) {
            console.error('Falha ao alternar o status do cartão:', err);
            error(
                'Erro ao Alterar Status',
                err.response?.data?.message || err.message || 'Não foi possível alterar o status do cartão.'
            );
        }
    };

    const handleDeleteCard = async (card: ExtendedBusinessCard) => {
        // Open beautiful confirmation modal instead of ugly browser alert
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            card: card,
            isLoading: false
        });
    };

    const confirmDeleteCard = async () => {
        if (!confirmModal.card) return;

        const card = confirmModal.card;
        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
            await axios.delete(`/cards/${card.id}`);

            // Remove card from local state
            setCards(prev => prev.filter(c => c.id !== card.id));

            // Close modal
            setConfirmModal({
                isOpen: false,
                type: null,
                card: null,
                isLoading: false
            });

            success(
                'Cartão Deletado!',
                `O cartão de ${card.name} foi removido com sucesso.`
            );
        } catch (err: any) {
            console.error('Failed to delete card:', err);

            setConfirmModal(prev => ({ ...prev, isLoading: false }));

            if (err.response?.status === 403) {
                error(
                    'Acesso Negado',
                    'Você não tem permissão para deletar este cartão.'
                );
            } else if (err.response?.status === 404) {
                error(
                    'Cartão Não Encontrado',
                    'O cartão que você está tentando deletar não existe mais.'
                );
            } else {
                error(
                    'Erro ao Deletar',
                    'Não foi possível deletar o cartão. Tente novamente ou contate o suporte.'
                );
            }
        }
    };

    const handleSaveCard = async (cardData: Partial<ExtendedBusinessCard>) => {
        const isEditing = !!selectedCard;
        
        info(
            isEditing ? 'Atualizando Cartão' : 'Criando Cartão',
            isEditing ? 'Salvando alterações...' : 'Criando novo cartão...'
        );

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

            success(
                isEditing ? 'Cartão Atualizado!' : 'Cartão Criado!',
                isEditing 
                    ? `As alterações no cartão de ${updatedCard.name} foram salvas.`
                    : `Novo cartão de ${updatedCard.name} foi criado com sucesso.`
            );
        } catch (err: any) {
            console.error('Falha ao salvar o cartão:', err);

            if (err.response && err.response.data) {
                console.error('Erros de validação:', err.response.data);
                error(
                    'Erro de Validação',
                    'Por favor, verifique os dados informados e tente novamente.'
                );
            } else {
                error(
                    'Erro ao Salvar',
                    'Não foi possível salvar o cartão. Tente novamente.'
                );
            }
        }
    };

    const handlePreview = (card: ExtendedBusinessCard) => {
        setSelectedCard(card);
        setIsPreviewOpen(true);
        info('Abrindo Preview', `Visualizando cartão de ${card.name}`);
    };

    // Copy short link to clipboard
    const copyShortLink = async (card: ExtendedBusinessCard) => {
        try {
            info('Gerando Link', `Criando link curto para ${card.name}...`);
            
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

                success(
                    'Link Copiado!',
                    `O link curto do cartão de ${card.name} foi copiado para a área de transferência.`
                );
            } else {
                throw new Error(response.data.message || 'Failed to get short link');
            }
        } catch (err: any) {
            console.error('Falha ao copiar link curto:', err);
            error(
                'Erro ao Copiar Link',
                err.response?.data?.message || err.message || 'Não foi possível gerar o link curto.'
            );
        }
    };

    // Share on WhatsApp with fallback
    const shareOnWhatsApp = async (card: ExtendedBusinessCard) => {
        try {
            info('Preparando WhatsApp', `Gerando link do WhatsApp para ${card.name}...`);

            const response = await axios.get(`/cards/${card.id}/whatsapp-share`);
            
            if (response.data.success) {
                const { whatsapp_url, fallback_message } = response.data;

                // Try to open WhatsApp
                const newWindow = window.open(whatsapp_url, '_blank');

                // If window didn't open (blocked), use fallback
                setTimeout(() => {
                    if (!newWindow || newWindow.closed) {
                        // Copy message to clipboard as fallback
                        navigator.clipboard.writeText(fallback_message).then(() => {
                            warning(
                                'WhatsApp Bloqueado',
                                'O popup foi bloqueado. A mensagem foi copiada para a área de transferência. Cole manualmente no WhatsApp.'
                            );
                        }).catch(() => {
                            error(
                                'WhatsApp Bloqueado',
                                `Popup bloqueado e não foi possível copiar automaticamente. Use esta mensagem:\n\n${fallback_message}`
                            );
                        });
                    } else {
                        success(
                            'WhatsApp Aberto!',
                            `Link do cartão de ${card.name} enviado para o WhatsApp.`
                        );
                    }
                }, 1000);
            } else {
                throw new Error(response.data.message || 'Failed to get WhatsApp share');
            }

        } catch (err: any) {
            console.error('Falha ao obter o link do WhatsApp:', err);
            error(
                'Erro no WhatsApp',
                err.response?.data?.message || err.message || 'Não foi possível gerar o link do WhatsApp.'
            );
        }
    };

    // Share via Email
    const shareViaEmail = async (card: ExtendedBusinessCard) => {
        try {
            info('Preparando Email', `Gerando conteúdo de email para ${card.name}...`);
            
            const response = await axios.get(`/cards/${card.id}/email-share`);
            
            if (response.data.success) {
                const { subject, body } = response.data;

                // Create email content for copying
                const emailContent = "Subject: " + subject + "\n\nTo: [Enter recipient email]\n\n" + body;

                // Try to copy to clipboard
                navigator.clipboard.writeText(emailContent).then(() => {
                    success(
                        'Email Preparado!',
                        'O conteúdo do email foi copiado! Agora abra seu cliente de email, cole o conteúdo e adicione o destinatário.'
                    );
                }).catch(() => {
                    // Fallback if clipboard doesn't work
                    const userCopy = prompt("Copie este conteúdo de e-mail manualmente:", emailContent);
                    if (userCopy !== null) {
                        info('Email Preparado', 'Use o conteúdo copiado em seu cliente de email.');
                    }
                });
            } else {
                throw new Error(response.data.message || 'Failed to get email share');
            }

        } catch (err: any) {
            console.error('Falha ao obter dados de e-mail:', err);
            error(
                'Erro no Email',
                err.response?.data?.message || err.message || 'Não foi possível gerar o conteúdo de email.'
            );
        }
    };

    // Send email directly to card owner
    const sendEmailToUser = async (card: ExtendedBusinessCard) => {
        if (!card.email) {
            warning(
                'Email Não Cadastrado',
                'Este cartão não possui endereço de e-mail. Adicione um email primeiro para poder enviar notificações.'
            );
            return;
        }

        // Open beautiful confirmation modal for email
        setConfirmModal({
            isOpen: true,
            type: 'email',
            card: card,
            isLoading: false
        });
    };

    const confirmSendEmail = async () => {
        if (!confirmModal.card?.email) return;

        const card = confirmModal.card;
        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await axios.get(`/cards/${card.id}/send-email`);

            // Close modal
            setConfirmModal({
                isOpen: false,
                type: null,
                card: null,
                isLoading: false
            });

            if (response.data.success) {
                success(
                    'Email Enviado!',
                    `Email de ativação enviado com sucesso para ${response.data.recipient}.`
                );
            } else {
                error('Falha no Envio', response.data.message || 'Não foi possível enviar o email.');
            }

        } catch (err: any) {
            console.error('Erro ao enviar e-mail:', err);
            
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
            
            error(
                'Erro no Envio',
                err.response?.data?.message || err.message || 'Falha ao enviar o email. Tente novamente.'
            );
        }
    };

    const closeConfirmModal = () => {
        if (confirmModal.isLoading) return; // Prevent closing while loading
        
        setConfirmModal({
            isOpen: false,
            type: null,
            card: null,
            isLoading: false
        });
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
        } catch (err: any) {
            console.error('Falha ao obter opções de compartilhamento:', err);
            error(
                'Erro nas Opções de Compartilhamento',
                err.response?.data?.message || err.message || 'Não foi possível obter as opções de compartilhamento.'
            );
            return null;
        }
    };

    // Handle social media sharing
    const handleSocialShare = async (card: ExtendedBusinessCard, platform: string) => {
        info('Abrindo Rede Social', `Compartilhando cartão de ${card.name} no ${platform}...`);
        
        const options = await getSharingOptions(card);
        if (!options) return;

        let url = '';
        let platformName = '';
        switch (platform) {
            case 'twitter':
                url = options.social.twitter;
                platformName = 'Twitter';
                break;
            case 'linkedin':
                url = options.social.linkedin;
                platformName = 'LinkedIn';
                break;
            case 'facebook':
                url = options.social.facebook;
                platformName = 'Facebook';
                break;
            case 'sms':
                url = options.sms.url;
                platformName = 'SMS';
                break;
        }

        if (url) {
            window.open(url, '_blank');
            success(
                `${platformName} Aberto!`,
                `Compartilhamento do cartão de ${card.name} aberto no ${platformName}.`
            );
        } else {
            error(
                'Link Não Disponível',
                `Não foi possível gerar o link para ${platformName}.`
            );
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
                        {/* <Button
                            className="w-full sm:w-auto gradient-button"
                            onClick={() => router.visit('/client/dashboard')}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            <span className="sm:inline">Criar cartão</span>
                        </Button> */}
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
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (e.target.value && filteredCards.length === 0) {
                                            info('Busca Ativa', `Nenhum resultado encontrado para "${e.target.value}"`);
                                        }
                                    }}
                                    className="pl-10 w-full"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => {
                                        setStatusFilter('all');
                                        info('Filtro Aplicado', 'Mostrando todos os cartões');
                                    }}
                                    className="text-xs sm:text-sm"
                                >
                                    Todos os cartões
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'activated' ? 'default' : 'outline'}
                                    onClick={() => {
                                        setStatusFilter('activated');
                                        info('Filtro Aplicado', `Mostrando ${activatedCount} cartões ativos`);
                                    }}
                                    className="text-xs sm:text-sm"
                                >
                                    Ativo ({activatedCount})
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                    onClick={() => {
                                        setStatusFilter('pending');
                                        info('Filtro Aplicado', `Mostrando ${pendingCount} cartões pendentes`);
                                    }}
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
                                                info('Filtros Limpos', 'Mostrando todos os cartões novamente');
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

                    {/* Beautiful Confirmation Modal */}
                    <ConfirmationModal
                        isOpen={confirmModal.isOpen}
                        onClose={closeConfirmModal}
                        onConfirm={confirmModal.type === 'delete' ? confirmDeleteCard : confirmSendEmail}
                        title={
                            confirmModal.type === 'delete' 
                                ? 'Deletar Cartão' 
                                : 'Enviar Email de Ativação'
                        }
                        description={
                            confirmModal.type === 'delete'
                                ? `Tem certeza que deseja deletar este cartão? Esta ação removerá permanentemente o cartão e todos os dados associados.`
                                : `Deseja enviar um email de ativação para o proprietário deste cartão?`
                        }
                        confirmText={
                            confirmModal.type === 'delete' ? 'Deletar Cartão' : 'Enviar Email'
                        }
                        cancelText="Cancelar"
                        type={confirmModal.type === 'delete' ? 'danger' : 'info'}
                        itemName={confirmModal.card?.name}
                        isLoading={confirmModal.isLoading}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

// Main component wrapper with ToastProvider
const AdminDashboard = () => {
    return (
        <ToastProvider>
            <AdminDashboardContent />
        </ToastProvider>
    );
};

export default AdminDashboard;