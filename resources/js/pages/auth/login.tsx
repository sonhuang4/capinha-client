import { Head } from '@inertiajs/react';
import { LogIn, LoaderCircle, Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useState, FormEvent, useCallback } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginError {
    email?: string[];
    password?: string[];
}

interface ApiResponse {
    success: boolean;
    message: string;
    redirect?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    role?: string;
    errors?: LoginError;
}

const LoginContent = () => {
    const [formData, setFormData] = useState<LoginForm>({
        email: '',
        password: '',
        remember: false
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<LoginError>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>('');
    const [isSendingReset, setIsSendingReset] = useState<boolean>(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'logout' | 'session-expired' | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        type: null,
        isLoading: false
    });

    const { success, error, warning, info } = useToast();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            setErrors({ email: ['O endereço de e-mail é obrigatório.'] });
            error('E-mail Obrigatório', 'Por favor, informe seu endereço de e-mail para continuar.');
            return false;
        }

        if (!validateEmail(formData.email)) {
            setErrors({ email: ['Por favor, insira um endereço de e-mail válido.'] });
            error('E-mail Inválido', 'Por favor, digite um endereço de e-mail válido no formato correto.');
            return false;
        }

        if (!formData.password) {
            setErrors({ password: ['A senha é obrigatória.'] });
            error('Senha Obrigatória', 'Por favor, digite sua senha para fazer login.');
            return false;
        }

        if (formData.password.length < 6) {
            setErrors({ password: ['A senha deve ter pelo menos 6 caracteres.'] });
            error('Senha Muito Curta', 'Sua senha deve ter pelo menos 6 caracteres.');
            return false;
        }

        return true;
    };

    const getCsrfToken = async (): Promise<string> => {
        try {
            // Garantir token CSRF atualizado
            await fetch('/sanctum/csrf-cookie', {
                method: 'GET',
                credentials: 'same-origin'
            });

            // Aguardar o cookie ser definido
            await new Promise(resolve => setTimeout(resolve, 100));

            // Tentar obter token da meta tag primeiro
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Se não encontrar, tentar do cookie
            if (!csrfToken) {
                const cookies = document.cookie.split(';');
                const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
                if (xsrfCookie) {
                    csrfToken = decodeURIComponent(xsrfCookie.split('=')[1]);
                }
            }

            if (!csrfToken) {
                throw new Error('Token CSRF não disponível');
            }

            return csrfToken;
        } catch (err) {
            error('Erro de Segurança', 'Não foi possível estabelecer conexão segura. Recarregue a página e tente novamente.');
            throw err;
        }
    };

    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        // Mostrar toast de carregamento
        info('Fazendo Login', 'Verificando suas credenciais...');

        try {
            const csrfToken = await getCsrfToken();

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData)
            });

            const data: ApiResponse = await response.json();

            if (response.ok && data.success) {
                // Sucesso
                const redirectUrl = data.redirect || '/client/dashboard';
                const userRole = data.user?.role || data.role || 'user';
                
                success(
                    'Bem-vindo de Volta!', 
                    `Login realizado com sucesso${data.user?.name ? ` como ${data.user.name}` : ''}. Redirecionando para seu painel ${userRole === 'admin' ? 'administrativo' : 'pessoal'}...`
                );

                // Pequeno atraso para mostrar mensagem de sucesso
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                // Tratar erros
                if (response.status === 419) {
                    // Token CSRF expirado - mostrar modal
                    setConfirmModal({
                        isOpen: true,
                        type: 'session-expired',
                        isLoading: false
                    });
                    return;
                }

                if (data.errors) {
                    setErrors(data.errors);
                    
                    // Mostrar toasts específicos para erros
                    if (data.errors.email) {
                        error('Erro no E-mail', data.errors.email[0]);
                    } else if (data.errors.password) {
                        error('Erro na Senha', data.errors.password[0]);
                    }
                } else if (data.message) {
                    setErrors({ email: [data.message] });
                    
                    if (data.message.toLowerCase().includes('credentials') || 
                        data.message.toLowerCase().includes('credenciais') ||
                        data.message.toLowerCase().includes('password') ||
                        data.message.toLowerCase().includes('senha')) {
                        error('Credenciais Inválidas', 'O e-mail ou senha digitados estão incorretos. Verifique e tente novamente.');
                    } else if (data.message.toLowerCase().includes('register') || 
                               data.message.toLowerCase().includes('cadastr')) {
                        warning('Conta Não Encontrada', 'Nenhuma conta encontrada com este e-mail. Cadastre-se primeiro ou verifique o endereço de e-mail.');
                    } else {
                        error('Falha no Login', data.message);
                    }
                } else {
                    setErrors({ email: ['Ocorreu um erro. Tente novamente.'] });
                    error('Falha no Login', 'Ocorreu um erro inesperado. Tente novamente.');
                }
            }
        } catch (err) {
            console.error('Erro no login:', err);
            setErrors({ email: ['Erro de rede. Verifique sua conexão e tente novamente.'] });
            error('Erro de Conexão', 'Erro de rede. Verifique sua conexão com a internet e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [formData, isLoading]);

    const handleChange = (field: keyof LoginForm, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpar erros quando usuário começa a digitar
        if (errors[field as keyof LoginError]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleForgotPassword = () => {
        setForgotPasswordEmail(formData.email);
        setShowForgotPasswordModal(true);
        info('Recuperar Senha', 'Digite seu endereço de e-mail para receber instruções de recuperação de senha.');
    };

    const sendPasswordReset = async () => {
        if (!forgotPasswordEmail.trim()) {
            error('E-mail Obrigatório', 'Por favor, digite seu endereço de e-mail.');
            return;
        }

        if (!validateEmail(forgotPasswordEmail)) {
            error('E-mail Inválido', 'Por favor, digite um endereço de e-mail válido.');
            return;
        }

        setIsSendingReset(true);
        info('Enviando E-mail', 'Aguarde enquanto enviamos as instruções de recuperação de senha...');

        try {
            const csrfToken = await getCsrfToken();
            
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ email: forgotPasswordEmail })
            });

            const data = await response.json();

            if (response.ok) {
                success(
                    'E-mail de Recuperação Enviado!', 
                    `As instruções de recuperação de senha foram enviadas para ${forgotPasswordEmail}. Verifique sua caixa de entrada e spam.`
                );
                setShowForgotPasswordModal(false);
                setForgotPasswordEmail('');
            } else {
                error('Falha no Envio', data.message || 'Não foi possível enviar o e-mail de recuperação. Tente novamente.');
            }
        } catch (err) {
            error('Erro de Rede', 'Não foi possível enviar o e-mail de recuperação. Verifique sua conexão e tente novamente.');
        } finally {
            setIsSendingReset(false);
        }
    };

    const handleSessionExpired = () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        info('Atualizando Sessão', 'Recarregando página para estabelecer nova sessão segura...');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const closeConfirmModal = () => {
        if (confirmModal.isLoading) return;
        
        setConfirmModal({
            isOpen: false,
            type: null,
            isLoading: false
        });
    };

    const closeForgotPasswordModal = () => {
        if (isSendingReset) return;
        
        setShowForgotPasswordModal(false);
        setForgotPasswordEmail('');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <Head title="Entrar" />
            <AnimatedBackground />

            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-sm shadow-xl rounded-xl bg-card text-card-foreground z-10 animate-fade-in">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <LogIn className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Bem-vindo de Volta
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Entre para acessar sua conta
                        </p>
                    </div>

                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Endereço de E-mail
                                </Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        required
                                        autoComplete="email"
                                        placeholder="voce@exemplo.com.br"
                                        disabled={isLoading}
                                        className="pl-10"
                                    />
                                </div>
                                <InputError message={errors.email?.[0]} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Senha
                                </Label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        placeholder="Digite sua senha"
                                        disabled={isLoading}
                                        className="pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
                                        disabled={isLoading}
                                        title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password?.[0]} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={formData.remember}
                                        onCheckedChange={(checked) => handleChange('remember', !!checked)}
                                        disabled={isLoading}
                                    />
                                    <Label 
                                        htmlFor="remember" 
                                        className="text-sm text-muted-foreground cursor-pointer"
                                    >
                                        Lembrar de mim
                                    </Label>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 disabled:opacity-70"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Entrar
                                    </>
                                )}
                            </Button>
                        </form>

                        <p className="mt-6 text-sm text-center text-muted-foreground">
                            Não tem uma conta?{' '}
                            <TextLink href="/register" className="underline hover:no-underline font-medium">
                                Cadastre-se aqui
                            </TextLink>
                        </p>
                    </CardContent>
                </div>
            </Card>

            {/* Modal de Esqueci a Senha */}
            <Dialog open={showForgotPasswordModal} onOpenChange={closeForgotPasswordModal}>
                <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Recuperar Senha
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Digite seu endereço de e-mail e enviaremos instruções para redefinir sua senha.
                        </p>
                        
                        <div>
                            <Label htmlFor="resetEmail" className="text-sm font-medium">
                                Endereço de E-mail
                            </Label>
                            <Input
                                id="resetEmail"
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                placeholder="voce@exemplo.com.br"
                                disabled={isSendingReset}
                                className="mt-1"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={closeForgotPasswordModal}
                                disabled={isSendingReset}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={sendPasswordReset}
                                disabled={isSendingReset}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isSendingReset ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Enviar Link
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Sessão Expirada */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={handleSessionExpired}
                title="Sessão Expirada"
                description="Sua sessão expirou por motivos de segurança. A página será recarregada para estabelecer uma nova conexão segura."
                confirmText="Recarregar Página"
                cancelText="Cancelar"
                type="warning"
                isLoading={confirmModal.isLoading}
            />
        </div>
    );
};

// Componente principal com ToastProvider
export default function Login() {
    return (
        <ToastProvider>
            <LoginContent />
        </ToastProvider>
    );
}