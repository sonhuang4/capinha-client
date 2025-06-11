import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { mockCards, BusinessCard } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Eye, Copy, MessageCircle, Mail, Share2, Check, Menu, X, Filter } from 'lucide-react';
import BusinessCardDisplay from '@/components/BusinessCardDisplay';
import CardForm from '@/components/CardForm';
import AdminLayout from '@/layouts/admin-layouts';
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

    useEffect(() => {
        axios.get('/cards')
            .then((response) => {
                setCards(response.data);
            })
            .catch((error: any) => {
                console.error('Error loading cards:', error);
            });
    }, []);

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
            console.error('Failed to toggle card status:', error);
        }
    };

    const handleEditCard = (card: ExtendedBusinessCard) => {
        setSelectedCard(card);
        setIsFormOpen(true);
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
            console.error('Failed to save card:', error);

            // Log the validation errors
            if (error.response && error.response.data) {
                console.error('Validation errors:', error.response.data);
                alert('Validation Error: ' + JSON.stringify(error.response.data));
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

            alert("Link Copied! Short link copied to clipboard");
        } catch (error: any) {
            console.error('Failed to copy short link:', error);
            alert("Error: Failed to copy link");
        }
    };

    // Share on WhatsApp with fallback
    const shareOnWhatsApp = async (card: ExtendedBusinessCard) => {
        try {
            console.log('Calling:', `/cards/${card.id}/whatsapp-share`);

            const response = await axios.get(`/cards/${card.id}/whatsapp-share`);
            const { whatsapp_url, fallback_message } = response.data;

            console.log('Got WhatsApp URL:', whatsapp_url);

            // Try to open WhatsApp
            const newWindow = window.open(whatsapp_url, '_blank');

            // If window didn't open (blocked), use fallback
            setTimeout(() => {
                if (!newWindow || newWindow.closed) {
                    // Copy message to clipboard as fallback
                    navigator.clipboard.writeText(fallback_message).then(() => {
                        alert("WhatsApp link blocked. Message copied to clipboard! Paste it in WhatsApp manually.");
                    }).catch(() => {
                        alert(`WhatsApp link blocked. Copy this message manually:\n\n${fallback_message}`);
                    });
                }
            }, 1000);

        } catch (error: any) {
            console.error('Failed to get WhatsApp link:', error);
            alert("Error: Failed to generate WhatsApp link");
        }
    };

    // Share via Email
    const shareViaEmail = async (card: ExtendedBusinessCard) => {
        try {
            const response = await axios.get('/cards/' + card.id + '/email-share');
            const { subject, body } = response.data;

            // Create email content for copying
            const emailContent = "Subject: " + subject + "\n\nTo: [Enter recipient email]\n\n" + body;

            // Try to copy to clipboard
            navigator.clipboard.writeText(emailContent).then(() => {
                alert("✅ Email content copied to clipboard!\n\nYou can now:\n1. Open Gmail/Yahoo/Outlook\n2. Paste the content\n3. Add recipient email\n4. Send!");
            }).catch(() => {
                // Fallback if clipboard doesn't work
                prompt("Copy this email content manually:", emailContent);
            });

        } catch (error: any) {
            console.error('Failed to get email data:', error);
            alert("Error: Failed to generate email content");
        }
    };

    // Send email directly to card owner
    const sendEmailToUser = async (card: ExtendedBusinessCard) => {
        if (!card.email) {
            alert("⚠️ This card has no email address. Please add an email first.");
            return;
        }

        if (!confirm("Send activation email to: " + card.email + "?")) {
            return;
        }

        try {
            const response = await axios.get('/cards/' + card.id + '/send-email');

            if (response.data.success) {
                alert("✅ Email sent successfully to: " + response.data.recipient);
            } else {
                alert("❌ Failed: " + response.data.message);
            }

        } catch (error: any) {
            console.error('Error sending email:', error);
            alert("❌ Failed to send email. Check console for details.");
        }
    };

    // Get all sharing options
    const getSharingOptions = async (card: ExtendedBusinessCard): Promise<SharingOptions | null> => {
        try {
            const response = await axios.get(`/cards/${card.id}/sharing-options`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get sharing options:', error);
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
                                Business Cards Management
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Create and manage digital business cards
                            </p>
                            
                            {/* Stats Row - Mobile First */}
                            <div className="flex flex-wrap gap-2 sm:gap-4 pt-2">
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Total:</span>
                                    <Badge variant="outline" className="text-xs">{cards.length}</Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Active:</span>
                                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">{activatedCount}</Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm">
                                    <span className="text-muted-foreground">Pending:</span>
                                    <Badge variant="secondary" className="text-xs">{pendingCount}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Create Button */}
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="w-full sm:w-auto gradient-button"
                                    onClick={() => setSelectedCard(null)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="sm:inline">Create Card</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedCard ? 'Edit Business Card' : 'Create New Business Card'}
                                    </DialogTitle>
                                </DialogHeader>
                                <CardForm
                                    card={selectedCard}
                                    onSave={handleSaveCard}
                                    onCancel={() => {
                                        setIsFormOpen(false);
                                        setSelectedCard(null);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
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
                                    All Cards
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'activated' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('activated')}
                                    className="text-xs sm:text-sm"
                                >
                                    Active ({activatedCount})
                                </Button>
                                <Button
                                    size="sm"
                                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                                    onClick={() => setStatusFilter('pending')}
                                    className="text-xs sm:text-sm"
                                >
                                    Pending ({pendingCount})
                                </Button>
                                
                                {/* Results Count */}
                                <div className="ml-auto flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                    <span>Showing:</span>
                                    <Badge variant="outline" className="text-xs">{filteredCards.length}</Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Cards Display */}
                    <Card className="material-card p-4 sm:p-6 animate-fade-in">
                        {filteredCards.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                {searchTerm || statusFilter !== 'all' ? (
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">No cards found</p>
                                        <p className="text-sm">
                                            {searchTerm && `No cards match "${searchTerm}". `}
                                            {statusFilter !== 'all' && `No ${statusFilter} cards found. `}
                                            Try adjusting your search or filter.
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
                                            Clear Filters
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">No cards yet</p>
                                        <p className="text-sm">Create your first digital business card to get started.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredCards.map((card) => (
                                    <div key={card.id} className="group relative">
                                        <div className={`relative rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                                            card.status === 'activated' 
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
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            card.status === 'activated' ? 'bg-emerald-500' : 'bg-amber-500'
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
                                                        onClick={() => handleEditCard(card)}
                                                        className="flex items-center justify-center p-2.5 text-xs font-medium rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-white/50 dark:border-gray-700/50"
                                                        title="Edit Card"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handlePreview(card)}
                                                        className="flex items-center justify-center p-2.5 text-xs font-medium rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all border border-white/50 dark:border-gray-700/50"
                                                        title="Preview Card"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => copyShortLink(card)}
                                                        className={`flex items-center justify-center p-2.5 text-xs font-medium rounded-lg transition-all border ${
                                                            copiedLinks.has(card.id) 
                                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600" 
                                                                : "bg-white/70 dark:bg-gray-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 border-white/50 dark:border-gray-700/50"
                                                        }`}
                                                        title={copiedLinks.has(card.id) ? "Link Copied!" : "Copy Link"}
                                                    >
                                                        {copiedLinks.has(card.id) ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => shareOnWhatsApp(card)}
                                                        className="flex-1 flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-sm hover:shadow-md transition-all"
                                                        title="Share on WhatsApp"
                                                    >
                                                        <MessageCircle className="w-5 h-5" />
                                                    </button>

                                                    <button
                                                        onClick={() => shareViaEmail(card)}
                                                        className="flex-1 flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-sm hover:shadow-md transition-all"
                                                        title="Share via Email"
                                                    >
                                                        <Mail className="w-5 h-5" />
                                                    </button>

                                                    {card.email ? (
                                                        <button
                                                            onClick={() => sendEmailToUser(card)}
                                                            className="flex-1 flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-sm hover:shadow-md transition-all"
                                                            title={`Send activation email to ${card.email}`}
                                                        >
                                                            <Mail className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button 
                                                                    className="flex-1 flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white shadow-sm hover:shadow-md transition-all"
                                                                    title="More sharing options"
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
                                <DialogTitle>Card Preview</DialogTitle>
                            </DialogHeader>
                            {selectedCard && (
                                <BusinessCardDisplay card={selectedCard} preview={true} />
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;