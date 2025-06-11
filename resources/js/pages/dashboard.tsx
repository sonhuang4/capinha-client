import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { mockCards, BusinessCard } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Eye, Copy, MessageCircle, Mail, Share2, Check } from 'lucide-react';
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
// Remove this import - we'll use simple alerts instead

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

const AdminDashboard = () => {

    useEffect(() => {
        axios.get('/cards')
            .then((response) => {
                setCards(response.data);
            })
            .catch((error) => {
                console.error('Error loading cards:', error);
            });
    }, []);

    const [cards, setCards] = useState<BusinessCard[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());

    const filteredCards = cards.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.id.includes(searchTerm)
    );

    const toggleCardStatus = async (cardId: string) => {
        try {
            const response = await axios.put(`/cards/${cardId}/toggle-status`);
            const updatedCard = response.data;
            setCards(prev =>
                prev.map(card =>
                    card.id === cardId ? { ...card, status: updatedCard.status } : card
                )
            );
        } catch (error) {
            console.error('Failed to toggle card status:', error);
        }
    };

    const handleEditCard = (card: BusinessCard) => {
        setSelectedCard(card);
        setIsFormOpen(true);
    };

    const handleSaveCard = async (cardData: Partial<BusinessCard>) => {
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
        } catch (error) {
            console.error('Failed to save card:', error);
        }
    };

    const handlePreview = (card: BusinessCard) => {
        setSelectedCard(card);
        setIsPreviewOpen(true);
    };

    // NEW: Copy short link to clipboard
    const copyShortLink = async (card: BusinessCard) => {
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
        } catch (error) {
            console.error('Failed to copy short link:', error);
            alert("Error: Failed to copy link");
        }
    };

    // NEW: Share on WhatsApp with fallback
    const shareOnWhatsApp = async (card: BusinessCard) => {
        try {
            // Make sure you're calling the RIGHT endpoint
            console.log('Calling:', `/cards/${card.id}/whatsapp-share`);
            
            const response = await axios.get(`/cards/${card.id}/whatsapp-share`);
            const { whatsapp_url, fallback_message } = response.data;
            
            console.log('Got WhatsApp URL:', whatsapp_url); // DEBUG: Check what URL you're getting
            
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
            
        } catch (error) {
            console.error('Failed to get WhatsApp link:', error);
            alert("Error: Failed to generate WhatsApp link");
        }
    };

    // NEW: Share via Email - FIXED
    const shareViaEmail = async (card: BusinessCard) => {
        try {
            const response = await axios.get(`/cards/${card.id}/email-share`);
            console.log('Email response:', response.data);
            const { mailto_url } = response.data;
             console.log('Mailto URL:', mailto_url); // ADD THIS
            // Use window.location.href instead of window.open for mailto
            window.location.href = mailto_url;
        } catch (error) {
            console.error('Failed to get email link:', error);
            alert("Error: Failed to generate email link");
        }
    };

    // NEW: Get all sharing options
    const getSharingOptions = async (card: BusinessCard): Promise<SharingOptions | null> => {
        try {
            const response = await axios.get(`/cards/${card.id}/sharing-options`);
            return response.data;
        } catch (error) {
            console.error('Failed to get sharing options:', error);
            return null;
        }
    };

    // NEW: Handle social media sharing
    const handleSocialShare = async (card: BusinessCard, platform: string) => {
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

    return (
        <AdminLayout>
            <div className="min-h-screen relative p-6 space-y-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Business Cards Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage digital business cards
                        </p>
                    </div>

                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="gradient-button"
                                onClick={() => setSelectedCard(null)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Card
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

                <Card className="material-card p-6 animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by name or card ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-medium">Card ID</th>
                                    <th className="text-left p-4 font-medium">Client Name</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Clicks</th>
                                    <th className="text-left p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCards.map((card) => (
                                    <tr key={card.id} className="border-b hover:bg-muted/20 transition-colors">
                                        <td className="p-4 font-mono text-sm">{card.id}</td>
                                        <td className="p-4 font-medium">{card.name}</td>
                                        <td className="p-4">
                                            <Badge variant={card.status === 'activated' ? 'default' : 'secondary'}>
                                                {card.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">{card.clickCount}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditCard(card)}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePreview(card)}
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                                
                                                {/* NEW: Copy Link Button */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => copyShortLink(card)}
                                                    className={copiedLinks.has(card.id) ? "bg-green-100 border-green-300" : ""}
                                                >
                                                    {copiedLinks.has(card.id) ? (
                                                        <Check className="w-3 h-3 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </Button>

                                                {/* NEW: WhatsApp Share Button */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => shareOnWhatsApp(card)}
                                                    className="text-green-600 hover:bg-green-50"
                                                >
                                                    <MessageCircle className="w-3 h-3" />
                                                </Button>

                                                {/* NEW: Email Share Button */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => shareViaEmail(card)}
                                                    className="text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Mail className="w-3 h-3" />
                                                </Button>

                                                {/* NEW: More Sharing Options Dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            <Share2 className="w-3 h-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleSocialShare(card, 'twitter')}>
                                                            Share on Twitter
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSocialShare(card, 'linkedin')}>
                                                            Share on LinkedIn
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSocialShare(card, 'facebook')}>
                                                            Share on Facebook
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSocialShare(card, 'sms')}>
                                                            Share via SMS
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Switch
                                                    checked={card.status === 'activated'}
                                                    onCheckedChange={() => toggleCardStatus(card.id)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Card Preview</DialogTitle>
                        </DialogHeader>
                        {selectedCard && (
                            <BusinessCardDisplay card={selectedCard} preview={true} />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;