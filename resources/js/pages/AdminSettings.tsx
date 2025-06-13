// resources/js/pages/AdminSettings.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Palette } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '@/layouts/admin-layouts';

const AdminSettings = () => {
  const [form, setForm] = useState({
    platform_name: '',
    admin_email: '',
    base_url: '',
    email_notifications: false,
    card_alerts: false,
    analytics_reports: false,
    two_factor: false,
    auto_logout: true,
    theme: 'blue',
    dark_mode: true
  });

  useEffect(() => {
    axios.get('/settings').then((res) => setForm(res.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (key: keyof typeof form) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    axios.post('/settings/save', form).then(() => alert('Configurações atualizadas.'));
  };

  const handleReset = () => {
    axios.post('/settings/reset').then((res) => setForm(res.data));
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">Configure as preferências e definições da plataforma</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Configurações Gerais</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="platformName">Nome da Plataforma</Label>
                <Input name="platform_name" value={form.platform_name} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="adminEmail">E-mail do Administrador</Label>
                <Input name="admin_email" type="email" value={form.admin_email} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="baseUrl">URL Base</Label>
                <Input name="base_url" value={form.base_url} onChange={handleChange} />
              </div>
            </div>
          </Card>

          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Notificações</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                </div>
                <Switch checked={form.email_notifications} onCheckedChange={() => handleToggle('email_notifications')} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Criação de Cartão</Label>
                  <p className="text-sm text-muted-foreground">Notifique-se quando novos cartões forem criados</p>
                </div>
                <Switch checked={form.card_alerts} onCheckedChange={() => handleToggle('card_alerts')} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Analíticos</Label>
                  <p className="text-sm text-muted-foreground">Resumo semanal de análises</p>
                </div>
                <Switch checked={form.analytics_reports} onCheckedChange={() => handleToggle('analytics_reports')} />
              </div>
            </div>
          </Card>

          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Segurança</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação em Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">Ative 2FA para maior segurança</p>
                </div>
                <Switch checked={form.two_factor} onCheckedChange={() => handleToggle('two_factor')} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Logout Automático</Label>
                  <p className="text-sm text-muted-foreground">Desconectar automaticamente após inatividade</p>
                </div>
                <Switch checked={form.auto_logout} onCheckedChange={() => handleToggle('auto_logout')} />
              </div>
              <Button variant="outline" className="w-full">Alterar Senha</Button>
            </div>
          </Card>

          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Aparência</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Tema Padrão do Cartão</Label>
                <select
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                >
                  <option>blue</option>
                  <option>purple</option>
                  <option>green</option>
                  <option>pink</option>
                  <option>orange</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">Usar tema escuro no painel administrativo</p>
                </div>
                <Switch checked={form.dark_mode} onCheckedChange={() => handleToggle('dark_mode')} />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>Restaurar Padrões</Button>
          <Button className="gradient-button" onClick={handleSubmit}>Salvar Alterações</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
