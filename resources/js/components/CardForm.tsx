import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { colorThemes } from '@/data/mockData';

const RequestCardForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    instagram: '',
    website: '',
    profile_picture: '',
    logo: '',
    color_theme: 'blue',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/request-card', formData);
  };

  return (
    <>
      <Head title="Solicitar Cartão Digital" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-xl w-full p-8 space-y-6"
        >
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Solicite seu Cartão Digital
          </h1>

          <div>
            <Label htmlFor="name">Nome completo *</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input name="instagram" value={formData.instagram} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input name="website" value={formData.website} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="profile_picture">Foto de Perfil (URL)</Label>
            <Input name="profile_picture" value={formData.profile_picture} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="logo">Logo (URL)</Label>
            <Input name="logo" value={formData.logo} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="color_theme">Tema de Cor</Label>
            <Select
              value={formData.color_theme}
              onValueChange={(value) => setFormData({ ...formData, color_theme: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um tema de cor" />
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

          <Button type="submit" className="w-full gradient-button">
            Enviar Solicitação
          </Button>
        </form>
      </div>
    </>
  );
};

export default RequestCardForm;
