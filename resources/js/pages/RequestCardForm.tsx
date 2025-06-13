import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { colorThemes } from '@/data/mockData';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';

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
      <div className="min-h-screen relative flex items-center justify-center p-6">
        <AnimatedBackground />

        {/* Theme toggle top-right */}
        <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-xl bg-card text-card-foreground rounded-xl shadow-xl p-6 sm:p-8 z-10 animate-fade-in space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
              Solicite seu Cartão Digital
            </h1>
            <p className="text-sm text-muted-foreground">
              Preencha os dados abaixo para solicitar seu cartão
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <SelectValue placeholder="Escolha um tema" />
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

            <Button type="submit" className="w-full gradient-button mt-4">
              Enviar Solicitação
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
};

export default RequestCardForm;
