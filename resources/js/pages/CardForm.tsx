import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layouts';

interface Props {
  prefill?: {
    name?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    website?: string;
    profile_picture?: string;
    logo?: string;
    color_theme?: string;
    request_id?: string;
  };
}

export default function CardForm({ prefill }: Props) {
  const [form, setForm] = useState({
    name: prefill?.name || '',
    email: prefill?.email || '',
    whatsapp: prefill?.whatsapp || '',
    instagram: prefill?.instagram || '',
    website: prefill?.website || '',
    profile_picture: prefill?.profile_picture || '',
    logo: prefill?.logo || '',
    color_theme: prefill?.color_theme || 'blue',
    request_id: prefill?.request_id || null, 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/cards', form);
  };

  return (
    <AdminLayout>
      <Head title="Criar Novo Cartão" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Criar novo cartão</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input name="instagram" value={form.instagram} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="website">Site</Label>
            <Input name="website" value={form.website} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="profile_picture">Foto de Perfil (URL)</Label>
            <Input name="profile_picture" value={form.profile_picture} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="logo">Logo (URL)</Label>
            <Input name="logo" value={form.logo} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="color_theme">Tema</Label>
            <select
              name="color_theme"
              value={form.color_theme}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-input rounded-md bg-background"
            >
              <option value="blue">Azul</option>
              <option value="green">Verde</option>
              <option value="purple">Roxo</option>
              <option value="pink">Rosa</option>
              <option value="orange">Laranja</option>
            </select>
          </div>

          <div className="pt-4">
            <Button type="submit" className="gradient-button">Salvar cartão</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
