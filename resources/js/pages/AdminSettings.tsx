// resources/js/pages/AdminSettings.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Palette, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '@/layouts/admin-layouts';

interface FormData {
  platform_name: string;
  admin_email: string;
  base_url: string;
  email_notifications: boolean;
  card_alerts: boolean;
  analytics_reports: boolean;
  two_factor: boolean;
  auto_logout: boolean;
  theme: string;
  dark_mode: boolean;
}

interface ValidationErrors {
  platform_name?: string;
  admin_email?: string;
  base_url?: string;
  theme?: string;
}

const AdminSettings = () => {
  const [form, setForm] = useState<FormData>({
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

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load settings on component mount
  useEffect(() => {
    setIsLoading(true);
    axios.get('/settings')
      .then((res) => {
        // Ensure all fields have default values
        const settingsData = {
          platform_name: res.data.platform_name || '',
          admin_email: res.data.admin_email || '',
          base_url: res.data.base_url || '',
          email_notifications: res.data.email_notifications || false,
          card_alerts: res.data.card_alerts || false,
          analytics_reports: res.data.analytics_reports || false,
          two_factor: res.data.two_factor || false,
          auto_logout: res.data.auto_logout !== undefined ? res.data.auto_logout : true,
          theme: res.data.theme || 'blue',
          dark_mode: res.data.dark_mode !== undefined ? res.data.dark_mode : true
        };
        setForm(settingsData);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        alert('Erro!\n\nNão foi possível carregar as configurações.\nTente recarregar a página.');
      });
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Toggle switch handler
  const handleToggle = (key: keyof FormData) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Frontend validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Platform name validation
    const platformName = form.platform_name || '';
    if (!platformName.trim()) {
      newErrors.platform_name = 'Nome da plataforma é obrigatório';
    } else if (platformName.trim().length < 2) {
      newErrors.platform_name = 'Nome da plataforma deve ter pelo menos 2 caracteres';
    } else if (platformName.trim().length > 255) {
      newErrors.platform_name = 'Nome da plataforma deve ter no máximo 255 caracteres';
    }

    // Email validation
    const adminEmail = form.admin_email || '';
    if (!adminEmail.trim()) {
      newErrors.admin_email = 'E-mail do administrador é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmail.trim())) {
        newErrors.admin_email = 'E-mail inválido';
      } else if (adminEmail.trim().length > 255) {
        newErrors.admin_email = 'E-mail deve ter no máximo 255 caracteres';
      }
    }

    // URL validation
    const baseUrl = form.base_url || '';
    if (!baseUrl.trim()) {
      newErrors.base_url = 'URL base é obrigatória';
    } else {
      try {
        const url = new URL(baseUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.base_url = 'URL deve começar com http:// ou https://';
        }
      } catch {
        newErrors.base_url = 'URL inválida';
      }
      
      if (baseUrl.trim().length > 255) {
        newErrors.base_url = 'URL deve ter no máximo 255 caracteres';
      }
    }

    // Theme validation
    const theme = form.theme || '';
    const validThemes = ['blue', 'purple', 'green', 'pink', 'orange'];
    if (!validThemes.includes(theme)) {
      newErrors.theme = 'Tema inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    // Clear previous success message
    setSuccessMessage('');

    // Frontend validation first
    if (!validateForm()) {
      // Show validation errors in alert
      const errorMessages = Object.values(errors).filter(Boolean);
      alert('Erro de Validação!\n\nPor favor, corrija os seguintes erros:\n\n• ' + errorMessages.join('\n• '));
      return;
    }

    setIsSaving(true);

    try {
      const response = await axios.post('/settings/save', form);
      
      if (response.data.success) {
        setSuccessMessage('Configurações salvas com sucesso!');
        alert('Sucesso!\n\nConfigurações salvas com sucesso!');
      } else {
        alert('Erro!\n\n' + response.data.message);
      }
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Laravel validation errors
        const backendErrors = error.response.data.errors;
        const errorMessages = Object.values(backendErrors).flat();
        alert('Erro de Validação!\n\n• ' + errorMessages.join('\n• '));
      } else if (error.response?.status === 500) {
        alert('Erro do Servidor!\n\nTente novamente em alguns minutos.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        alert('Erro de Conexão!\n\nVerifique sua internet e tente novamente.');
      } else {
        alert('Erro!\n\nTente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset handler
  const handleReset = async () => {
    if (!confirm('Confirmação!\n\nTem certeza que deseja restaurar as configurações padrão?\n\nEsta ação não pode ser desfeita.')) {
      return;
    }

    setIsResetting(true);
    setSuccessMessage('');

    try {
      const response = await axios.post('/settings/reset');
      setForm(response.data);
      setErrors({});
      setSuccessMessage('Configurações restauradas!');
      alert('Sucesso!\n\nConfigurações restauradas para os padrões!');
    } catch (error: any) {
      if (error.response?.status === 500) {
        alert('Erro do Servidor!\n\nTente novamente em alguns minutos.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        alert('Erro de Conexão!\n\nVerifique sua internet e tente novamente.');
      } else {
        alert('Erro!\n\nNão foi possível restaurar as configurações.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">Configure as preferências e definições da plataforma</p>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 dark:text-green-200">{successMessage}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Configurações Gerais</h3>
            </div>

            <div className="space-y-4">
              {/* Platform Name */}
              <div>
                <Label htmlFor="platform_name">Nome da Plataforma *</Label>
                <Input 
                  name="platform_name" 
                  value={form.platform_name} 
                  onChange={handleChange}
                  className={errors.platform_name ? 'border-red-500 focus:border-red-500' : ''}
                  placeholder="Digite o nome da plataforma"
                />
                {errors.platform_name && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.platform_name}
                  </div>
                )}
              </div>

              {/* Admin Email */}
              <div>
                <Label htmlFor="admin_email">E-mail do Administrador *</Label>
                <Input 
                  name="admin_email" 
                  type="email" 
                  value={form.admin_email} 
                  onChange={handleChange}
                  className={errors.admin_email ? 'border-red-500 focus:border-red-500' : ''}
                  placeholder="admin@exemplo.com"
                />
                {errors.admin_email && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.admin_email}
                  </div>
                )}
              </div>

              {/* Base URL */}
              <div>
                <Label htmlFor="base_url">URL Base *</Label>
                <Input 
                  name="base_url" 
                  value={form.base_url} 
                  onChange={handleChange}
                  className={errors.base_url ? 'border-red-500 focus:border-red-500' : ''}
                  placeholder="https://seudominio.com.br"
                />
                {errors.base_url && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.base_url}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Notifications */}
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
                <Switch 
                  checked={form.email_notifications} 
                  onCheckedChange={() => handleToggle('email_notifications')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Criação de Cartão</Label>
                  <p className="text-sm text-muted-foreground">Notifique-se quando novos cartões forem criados</p>
                </div>
                <Switch 
                  checked={form.card_alerts} 
                  onCheckedChange={() => handleToggle('card_alerts')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Analíticos</Label>
                  <p className="text-sm text-muted-foreground">Resumo semanal de análises</p>
                </div>
                <Switch 
                  checked={form.analytics_reports} 
                  onCheckedChange={() => handleToggle('analytics_reports')} 
                />
              </div>
            </div>
          </Card>

          {/* Security */}
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
                <Switch 
                  checked={form.two_factor} 
                  onCheckedChange={() => handleToggle('two_factor')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Logout Automático</Label>
                  <p className="text-sm text-muted-foreground">Desconectar automaticamente após inatividade</p>
                </div>
                <Switch 
                  checked={form.auto_logout} 
                  onCheckedChange={() => handleToggle('auto_logout')} 
                />
              </div>
              
              <Button variant="outline" className="w-full">
                Alterar Senha
              </Button>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Aparência</h3>
            </div>

            <div className="space-y-4">
              {/* Theme Selection */}
              <div>
                <Label>Tema Padrão do Cartão *</Label>
                <select
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  className={`w-full mt-1 p-2 border rounded-md bg-background ${
                    errors.theme ? 'border-red-500' : 'border-input'
                  }`}
                >
                  <option value="blue">Azul</option>
                  <option value="purple">Roxo</option>
                  <option value="green">Verde</option>
                  <option value="pink">Rosa</option>
                  <option value="orange">Laranja</option>
                </select>
                {errors.theme && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.theme}
                  </div>
                )}
              </div>
              
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">Usar tema escuro no painel administrativo</p>
                </div>
                <Switch 
                  checked={form.dark_mode} 
                  onCheckedChange={() => handleToggle('dark_mode')} 
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isResetting || isSaving}
          >
            {isResetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Restaurando...
              </>
            ) : (
              'Restaurar Padrões'
            )}
          </Button>
          
          <Button 
            className="gradient-button" 
            onClick={handleSubmit}
            disabled={isSaving || isResetting}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>

        {/* Required Fields Note */}
        <div className="text-sm text-muted-foreground">
          <span className="text-red-500">*</span> Campos obrigatórios
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;