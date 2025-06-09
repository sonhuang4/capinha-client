import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { mockCards, BusinessCard } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Eye } from 'lucide-react';
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

    const filteredCards = cards.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.id.includes(searchTerm)
    );

    const toggleCardStatus = (cardId: string) => {
        setCards(prev => prev.map(card =>
            card.id === cardId
                ? { ...card, status: card.status === 'activated' ? 'pending' : 'activated' }
                : card
        ));
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
