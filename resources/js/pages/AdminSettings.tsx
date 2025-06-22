// resources/js/pages/AdminSettings.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Settings, Bell, Shield, Palette, AlertCircle, CheckCircle, Save, RotateCcw, Key, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface PasswordChangeForm {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

const AdminSettingsContent = () => {
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
  
  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'reset' | 'unsaved-changes' | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    type: null,
    isLoading: false
  });

  const { success, error, warning, info } = useToast();

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    info('Carregando Configurações', 'Buscando configurações atuais da plataforma...');

    try {
      const response = await axios.get('/settings');
      
      // Garantir que todos os campos tenham valores padrão
      const settingsData = {
        platform_name: response.data.platform_name || '',
        admin_email: response.data.admin_email || '',
        base_url: response.data.base_url || '',
        email_notifications: response.data.email_notifications || false,
        card_alerts: response.data.card_alerts || false,
        analytics_reports: response.data.analytics_reports || false,
        two_factor: response.data.two_factor || false,
        auto_logout: response.data.auto_logout !== undefined ? response.data.auto_logout : true,
        theme: response.data.theme || 'blue',
        dark_mode: response.data.dark_mode !== undefined ? response.data.dark_mode : true
      };
      
      setForm(settingsData);
      success('Configurações Carregadas', 'Configurações carregadas com sucesso!');
    } catch (err: any) {
      error(
        'Erro ao Carregar Configurações', 
        'Não foi possível carregar as configurações. Tente recarregar a página.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Manipulador de mudança de input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro para este campo quando usuário começa a digitar
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Manipulador de toggle switch
  const handleToggle = (key: keyof FormData) => {
    const newValue = !form[key];
    setForm(prev => ({ ...prev, [key]: newValue }));
    
    // Mostrar feedback para mudanças importantes
    if (key === 'two_factor') {
      if (newValue) {
        info('2FA Ativado', 'Autenticação em dois fatores foi ativada para maior segurança.');
      } else {
        warning('2FA Desativado', 'Autenticação em dois fatores foi desativada. Considere mantê-la ativa.');
      }
    } else if (key === 'email_notifications') {
      if (newValue) {
        success('Notificações Ativadas', 'Você receberá notificações por e-mail.');
      } else {
        info('Notificações Desativadas', 'Notificações por e-mail foram desativadas.');
      }
    }
  };

  // Validação frontend
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validação do nome da plataforma
    const platformName = form.platform_name || '';
    if (!platformName.trim()) {
      newErrors.platform_name = 'Nome da plataforma é obrigatório';
    } else if (platformName.trim().length < 2) {
      newErrors.platform_name = 'Nome da plataforma deve ter pelo menos 2 caracteres';
    } else if (platformName.trim().length > 255) {
      newErrors.platform_name = 'Nome da plataforma deve ter no máximo 255 caracteres';
    }

    // Validação do e-mail
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

    // Validação da URL
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

    // Validação do tema
    const theme = form.theme || '';
    const validThemes = ['blue', 'purple', 'green', 'pink', 'orange'];
    if (!validThemes.includes(theme)) {
      newErrors.theme = 'Tema inválido';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).filter(Boolean);
      error(
        'Erro de Validação', 
        `Por favor, corrija os seguintes erros: ${errorMessages.join(', ')}`
      );
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Manipulador de submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    info('Salvando Configurações', 'Aplicando suas alterações...');

    try {
      const response = await axios.post('/settings/save', form);
      
      if (response.data.success) {
        success(
          'Configurações Salvas!', 
          'Todas as configurações foram salvas com sucesso. As mudanças já estão ativas.'
        );
      } else {
        error('Erro ao Salvar', response.data.message || 'Não foi possível salvar as configurações.');
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Erros de validação do Laravel
        const backendErrors = err.response.data.errors;
        const errorMessages = Object.values(backendErrors).flat() as string[];
        error(
          'Erro de Validação do Servidor', 
          errorMessages.join(', ')
        );
      } else if (err.response?.status === 500) {
        error(
          'Erro do Servidor', 
          'Erro interno do servidor. Tente novamente em alguns minutos.'
        );
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        error(
          'Erro de Conexão', 
          'Verifique sua conexão com a internet e tente novamente.'
        );
      } else {
        error('Erro Inesperado', 'Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Manipulador de reset
  const handleResetRequest = () => {
    setConfirmModal({
      isOpen: true,
      type: 'reset',
      isLoading: false
    });
  };

  const handleResetConfirm = async () => {
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    info('Restaurando Configurações', 'Aplicando configurações padrão...');

    try {
      const response = await axios.post('/settings/reset');
      setForm(response.data);
      setErrors({});
      
      setConfirmModal({
        isOpen: false,
        type: null,
        isLoading: false
      });
      
      success(
        'Configurações Restauradas!', 
        'Todas as configurações foram restauradas para os valores padrão.'
      );
    } catch (err: any) {
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
      
      if (err.response?.status === 500) {
        error(
          'Erro do Servidor', 
          'Erro interno do servidor. Tente novamente em alguns minutos.'
        );
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        error(
          'Erro de Conexão', 
          'Verifique sua conexão com a internet e tente novamente.'
        );
      } else {
        error(
          'Erro ao Restaurar', 
          'Não foi possível restaurar as configurações. Tente novamente.'
        );
      }
    }
  };

  // Alterar senha
  const handlePasswordChange = () => {
    setShowPasswordModal(true);
    setPasswordForm({
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    });
    info('Alterar Senha', 'Preencha os campos para alterar sua senha.');
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.current_password) {
      error('Senha Atual Obrigatória', 'Digite sua senha atual para continuar.');
      return;
    }

    if (!passwordForm.new_password) {
      error('Nova Senha Obrigatória', 'Digite uma nova senha.');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      error('Senha Muito Curta', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      error('Senhas Não Conferem', 'A confirmação da nova senha não confere.');
      return;
    }

    setIsChangingPassword(true);
    info('Alterando Senha', 'Aplicando nova senha...');

    try {
      const response = await axios.post('/admin/change-password', passwordForm);
      
      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        
        success(
          'Senha Alterada!', 
          'Sua senha foi alterada com sucesso. Use a nova senha no próximo login.'
        );
      } else {
        error('Erro ao Alterar Senha', response.data.message || 'Não foi possível alterar a senha.');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        error('Senha Atual Incorreta', 'A senha atual informada está incorreta.');
      } else if (err.response?.status === 422) {
        error('Dados Inválidos', 'Verifique os dados informados e tente novamente.');
      } else {
        error('Erro Inesperado', 'Ocorreu um erro ao alterar a senha. Tente novamente.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closeConfirmModal = () => {
    if (confirmModal.isLoading) return;
    
    setConfirmModal({
      isOpen: false,
      type: null,
      isLoading: false
    });
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;
    
    setShowPasswordModal(false);
    setPasswordForm({
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    });
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">Carregando Configurações</p>
              <p className="text-sm text-muted-foreground">Aguarde enquanto buscamos suas configurações...</p>
            </div>
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
            Configurações da Plataforma
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure as preferências e definições da plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações Gerais */}
          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Configurações Gerais</h3>
            </div>

            <div className="space-y-4">
              {/* Nome da Plataforma */}
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

              {/* E-mail do Administrador */}
              <div>
                <Label htmlFor="admin_email">E-mail do Administrador *</Label>
                <Input 
                  name="admin_email" 
                  type="email" 
                  value={form.admin_email} 
                  onChange={handleChange}
                  className={errors.admin_email ? 'border-red-500 focus:border-red-500' : ''}
                  placeholder="admin@exemplo.com.br"
                />
                {errors.admin_email && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.admin_email}
                  </div>
                )}
              </div>

              {/* URL Base */}
              <div>
                <Label htmlFor="base_url">URL Base da Plataforma *</Label>
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
                <p className="text-xs text-muted-foreground mt-1">
                  URL base usada para links dos cartões de visita
                </p>
              </div>
            </div>
          </Card>

          {/* Notificações */}
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
                  <p className="text-sm text-muted-foreground">Receber notificações importantes por e-mail</p>
                </div>
                <Switch 
                  checked={form.email_notifications} 
                  onCheckedChange={() => handleToggle('email_notifications')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Novos Cartões</Label>
                  <p className="text-sm text-muted-foreground">Notificar quando novos cartões forem criados</p>
                </div>
                <Switch 
                  checked={form.card_alerts} 
                  onCheckedChange={() => handleToggle('card_alerts')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">Resumo semanal de estatísticas e análises</p>
                </div>
                <Switch 
                  checked={form.analytics_reports} 
                  onCheckedChange={() => handleToggle('analytics_reports')} 
                />
              </div>
            </div>
          </Card>

          {/* Segurança */}
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
                  <Label>Autenticação em Dois Fatores (2FA)</Label>
                  <p className="text-sm text-muted-foreground">Ativar 2FA para maior segurança da conta</p>
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
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handlePasswordChange}
              >
                <Key className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </Card>

          {/* Aparência */}
          <Card className="material-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Aparência</h3>
            </div>

            <div className="space-y-4">
              {/* Seleção de Tema */}
              <div>
                <Label>Tema Padrão dos Cartões *</Label>
                <select
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  className={`w-full mt-1 p-2 border rounded-md bg-background ${
                    errors.theme ? 'border-red-500' : 'border-input'
                  }`}
                >
                  <option value="blue">🔵 Azul Profissional</option>
                  <option value="purple">🟣 Roxo Elegante</option>
                  <option value="green">🟢 Verde Natureza</option>
                  <option value="pink">🌸 Rosa Moderno</option>
                  <option value="orange">🟠 Laranja Vibrante</option>
                </select>
                {errors.theme && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.theme}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Tema padrão aplicado aos novos cartões criados
                </p>
              </div>
              
              {/* Modo Escuro */}
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

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleResetRequest}
            disabled={isResetting || isSaving}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isResetting ? 'Restaurando...' : 'Restaurar Padrões'}
          </Button>
          
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0" 
            onClick={handleSubmit}
            disabled={isSaving || isResetting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        {/* Nota sobre Campos Obrigatórios */}
        <div className="text-sm text-muted-foreground border-t pt-4">
          <span className="text-red-500">*</span> Campos obrigatórios
        </div>
      </div>

      {/* Modal de Alterar Senha */}
      <Dialog open={showPasswordModal} onOpenChange={closePasswordModal}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Alterar Senha
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para alterar sua senha, preencha os campos abaixo. A nova senha deve ter pelo menos 6 caracteres.
            </p>
            
            {/* Senha Atual */}
            <div>
              <Label htmlFor="current_password">Senha Atual *</Label>
              <div className="relative mt-1">
                <Input
                  id="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  placeholder="Digite sua senha atual"
                  disabled={isChangingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isChangingPassword}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <Label htmlFor="new_password">Nova Senha *</Label>
              <div className="relative mt-1">
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                  disabled={isChangingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isChangingPassword}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <Label htmlFor="new_password_confirmation">Confirmar Nova Senha *</Label>
              <div className="relative mt-1">
                <Input
                  id="new_password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                  placeholder="Confirme a nova senha"
                  disabled={isChangingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isChangingPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Indicador de força da senha */}
            {passwordForm.new_password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Força da senha:</span>
                  <span className={`text-xs font-medium ${
                    passwordForm.new_password.length < 6 ? 'text-red-500' :
                    passwordForm.new_password.length < 8 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {passwordForm.new_password.length < 6 ? 'Fraca' :
                     passwordForm.new_password.length < 8 ? 'Média' : 'Forte'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full ${
                        i < (passwordForm.new_password.length < 6 ? 1 : passwordForm.new_password.length < 8 ? 2 : 3)
                          ? passwordForm.new_password.length < 6 ? 'bg-red-500' :
                            passwordForm.new_password.length < 8 ? 'bg-yellow-500' : 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Indicador de senhas conferindo */}
            {passwordForm.new_password_confirmation && (
              <div className="flex items-center space-x-2">
                {passwordForm.new_password === passwordForm.new_password_confirmation ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">Senhas conferem</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">Senhas não conferem</span>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={closePasswordModal}
                disabled={isChangingPassword}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                disabled={isChangingPassword || passwordForm.new_password !== passwordForm.new_password_confirmation}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Alterando...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Reset */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'reset'}
        onClose={closeConfirmModal}
        onConfirm={handleResetConfirm}
        title="Restaurar Configurações Padrão"
        description="Tem certeza que deseja restaurar todas as configurações para os valores padrão? Esta ação não pode ser desfeita e todas as suas personalizações serão perdidas."
        confirmText="Restaurar Padrões"
        cancelText="Cancelar"
        type="warning"
        isLoading={confirmModal.isLoading}
      />
    </AdminLayout>
  );
};

// Componente principal com ToastProvider
const AdminSettings = () => {
  return (
    <ToastProvider>
      <AdminSettingsContent />
    </ToastProvider>
  );
};

export default AdminSettings;