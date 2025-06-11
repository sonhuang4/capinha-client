
import React, { useState, useEffect } from 'react';
import { BusinessCard, colorThemes } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BusinessCardDisplay from './BusinessCardDisplay';

interface CardFormProps {
  card?: BusinessCard | null;
  onSave: (cardData: Partial<BusinessCard>) => void;
  onCancel: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ card, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    logo: '',
    whatsapp: '',
    instagram: '',
    website: '',
    colorTheme: 'blue' as keyof typeof colorThemes,
    status: 'pending' as 'activated' | 'pending'
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        email: card.email,
        profilePicture: card.profilePicture || '',
        logo: card.logo || '',
        whatsapp: card.whatsapp || '',
        instagram: card.instagram || '',
        website: card.website || '',
        colorTheme: card.colorTheme,
        status: card.status
      });
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const previewCard: BusinessCard = {
    id: 'preview',
    activationCode: 'preview',
    clickCount: 0,
    ...formData
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Smith"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="shohei.chen.dev@gmail.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="profilePicture">Profile Picture URL</Label>
            <Input
              id="profilePicture"
              value={formData.profilePicture}
              onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.com/logo.jpg"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram Username</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="username"
            />
          </div>

          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="colorTheme">Color Theme</Label>
            <Select
              value={formData.colorTheme}
              onValueChange={(value) => setFormData({ ...formData, colorTheme: value as keyof typeof colorThemes })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(colorThemes).map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as 'activated' | 'pending' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="activated">Activated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="gradient-button flex-1">
              {card ? 'Update Card' : 'Create Card'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <div className="lg:sticky lg:top-4">
        <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
        <BusinessCardDisplay card={previewCard} preview={true} />
      </div>
    </div>
  );
};

export default CardForm;
