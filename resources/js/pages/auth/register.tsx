import { Head } from '@inertiajs/react';
import { UserPlus, LoaderCircle, Eye, EyeOff, Check, X, User, Mail, Lock, Shield, AlertTriangle } from 'lucide-react';
import { useState, FormEvent, useCallback, useMemo } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface RegisterError {
    name?: string[];
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
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
    errors?: RegisterError;
}

interface PasswordStrength {
    score: number;
    checks: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        match: boolean;
    };
}

const RegisterContent = () => {
    const [formData, setFormData] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<RegisterError>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'session-expired' | 'email-exists' | null;
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

    const passwordStrength: PasswordStrength = useMemo(() => {
        const password = formData.password;
        const checks = {
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            match: password.length > 0 && password === formData.password_confirmation
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        return { score, checks };
    }, [formData.password, formData.password_confirmation]);

    const validateForm = (): boolean => {
        const newErrors: RegisterError = {};

        if (!formData.name.trim()) {
            newErrors.name = ['O nome completo é obrigatório.'];
            error('Nome Obrigatório', 'Por favor, informe seu nome completo para continuar.');
        } else if (formData.name.trim().length < 2) {
            newErrors.name = ['O nome deve ter pelo menos 2 caracteres.'];
            error('Nome Muito Curto', 'Seu nome deve ter pelo menos 2 caracteres.');
        }

        if (!formData.email.trim()) {
            newErrors.email = ['O endereço de e-mail é obrigatório.'];
            error('E-mail Obrigatório', 'Por favor, informe seu endereço de e-mail.');
        } else if (!validateEmail(formData.email)) {
            newErrors.email = ['Por favor, insira um endereço de e-mail válido.'];
            error('E-mail Inválido', 'Por favor, digite um endereço de e-mail válido no formato correto.');
        }

        if (!formData.password) {
            newErrors.password = ['A senha é obrigatória.'];
            error('Senha Obrigatória', 'Por favor, crie uma senha para sua conta.');
        } else if (!passwordStrength.checks.length) {
            newErrors.password = ['A senha deve ter pelo menos 6 caracteres.'];
            error('Senha Muito Curta', 'Sua senha deve ter pelo menos 6 caracteres.');
        } else if (!passwordStrength.checks.uppercase) {
            newErrors.password = ['A senha deve conter pelo menos uma letra maiúscula.'];
            error('Senha Incompleta', 'Adicione pelo menos uma letra maiúscula à sua senha.');
        } else if (!passwordStrength.checks.lowercase) {
            newErrors.password = ['A senha deve conter pelo menos uma letra minúscula.'];
            error('Senha Incompleta', 'Adicione pelo menos uma letra minúscula à sua senha.');
        } else if (!passwordStrength.checks.number) {
            newErrors.password = ['A senha deve conter pelo menos um número.'];
            error('Senha Incompleta', 'Adicione pelo menos um número à sua senha.');
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = ['A confirmação da senha é obrigatória.'];
            error('Confirmação Obrigatória', 'Por favor, confirme sua senha.');
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = ['A confirmação da senha não confere.'];
            error('Senhas Não Conferem', 'As senhas digitadas não são iguais. Verifique e tente novamente.');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

        if (passwordStrength.score < 4) {
            warning(
                'Senha Fraca Detectada',
                'Para sua segurança, complete todos os requisitos da senha antes de continuar.'
            );
            return;
        }

        setIsLoading(true);
        setErrors({});

        // Mostrar toast de carregamento
        info('Criando Sua Conta', 'Validando informações e configurando sua conta...');

        try {
            const csrfToken = await getCsrfToken();

            const response = await fetch('/register', {
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
                const userRole = data.user?.role || data.role || 'client';
                
                success(
                    'Conta Criada com Sucesso!', 
                    `Bem-vindo(a), ${data.user?.name || formData.name}! Sua conta foi criada e você já está logado. Redirecionando para seu painel ${userRole === 'admin' ? 'administrativo' : 'pessoal'}...`
                );

                // Pequeno atraso para mostrar mensagem de sucesso
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
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
                    if (data.errors.name) {
                        error('Erro no Nome', data.errors.name[0]);
                    } else if (data.errors.email) {
                        if (data.errors.email[0].toLowerCase().includes('already') || 
                            data.errors.email[0].toLowerCase().includes('já') ||
                            data.errors.email[0].toLowerCase().includes('existe')) {
                            setConfirmModal({
                                isOpen: true,
                                type: 'email-exists',
                                isLoading: false
                            });
                        } else {
                            error('Erro no E-mail', data.errors.email[0]);
                        }
                    } else if (data.errors.password) {
                        error('Erro na Senha', data.errors.password[0]);
                    } else if (data.errors.password_confirmation) {
                        error('Erro na Confirmação', data.errors.password_confirmation[0]);
                    }
                } else if (data.message) {
                    setErrors({ email: [data.message] });
                    
                    if (data.message.toLowerCase().includes('already') || 
                        data.message.toLowerCase().includes('já') ||
                        data.message.toLowerCase().includes('existe')) {
                        warning('E-mail Já Cadastrado', 'Este e-mail já possui uma conta. Que tal fazer login?');
                    } else {
                        error('Erro no Cadastro', data.message);
                    }
                } else {
                    setErrors({ email: ['Ocorreu um erro. Tente novamente.'] });
                    error('Erro no Cadastro', 'Ocorreu um erro inesperado. Tente novamente.');
                }
            }
        } catch (err) {
            console.error('Erro no cadastro:', err);
            setErrors({ email: ['Erro de rede. Verifique sua conexão e tente novamente.'] });
            error('Erro de Conexão', 'Erro de rede. Verifique sua conexão com a internet e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [formData, isLoading, passwordStrength.score]);

    const handleChange = (field: keyof RegisterForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpar erros quando usuário começa a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const getPasswordStrengthColor = (score: number): string => {
        if (score < 2) return 'text-red-500';
        if (score < 4) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getPasswordStrengthText = (score: number): string => {
        if (score < 2) return 'Fraca';
        if (score < 4) return 'Média';
        return 'Forte';
    };

    const handleSessionExpired = () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        
        info('Atualizando Sessão', 'Recarregando página para estabelecer nova sessão segura...');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const handleEmailExists = () => {
        setConfirmModal({
            isOpen: false,
            type: null,
            isLoading: false
        });
        
        // Redirecionar para login com e-mail pré-preenchido
        window.location.href = `/login?email=${encodeURIComponent(formData.email)}`;
    };

    const closeConfirmModal = () => {
        if (confirmModal.isLoading) return;
        
        setConfirmModal({
            isOpen: false,
            type: null,
            isLoading: false
        });
    };

    const showTerms = () => {
        setShowTermsModal(true);
        info('Termos de Uso', 'Revise nossos termos de uso e política de privacidade.');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <Head title="Criar Conta" />
            <AnimatedBackground />

            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-md shadow-xl rounded-xl bg-card text-card-foreground z-10 animate-fade-in">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Criar Conta
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Preencha suas informações para criar sua conta
                        </p>
                    </div>

                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Nome Completo
                                </Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                        placeholder="João Silva"
                                        disabled={isLoading}
                                        className="pl-10"
                                    />
                                </div>
                                <InputError message={errors.name?.[0]} className="mt-1" />
                            </div>

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
                                        autoComplete="new-password"
                                        placeholder="Crie uma senha forte"
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
                                
                                {formData.password && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Força da senha:</span>
                                            <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength.score)}`}>
                                                {getPasswordStrengthText(passwordStrength.score)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-1">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 rounded-full ${
                                                        i < passwordStrength.score
                                                            ? passwordStrength.score < 2
                                                                ? 'bg-red-500'
                                                                : passwordStrength.score < 4
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'
                                                            : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            {[
                                                { key: 'length', text: 'Pelo menos 6 caracteres' },
                                                { key: 'uppercase', text: 'Uma letra maiúscula' },
                                                { key: 'lowercase', text: 'Uma letra minúscula' },
                                                { key: 'number', text: 'Um número' }
                                            ].map(({ key, text }) => (
                                                <div key={key} className="flex items-center space-x-2">
                                                    {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                                                        <Check className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <X className="h-3 w-3 text-gray-400" />
                                                    )}
                                                    <span className={`text-xs ${
                                                        passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-gray-500'
                                                    }`}>
                                                        {text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <InputError message={errors.password?.[0]} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                    Confirmar Senha
                                </Label>
                                <div className="relative mt-1">
                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        placeholder="Confirme sua senha"
                                        disabled={isLoading}
                                        className="pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
                                        disabled={isLoading}
                                        title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                                
                                {formData.password_confirmation && (
                                    <div className="mt-1 flex items-center space-x-2">
                                        {passwordStrength.checks.match ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <X className="h-3 w-3 text-red-500" />
                                        )}
                                        <span className={`text-xs ${
                                            passwordStrength.checks.match
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {passwordStrength.checks.match ? 'Senhas conferem' : 'Senhas não conferem'}
                                        </span>
                                    </div>
                                )}
                                <InputError message={errors.password_confirmation?.[0]} className="mt-1" />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 disabled:opacity-70"
                                disabled={isLoading || passwordStrength.score < 4}
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                        Criando conta...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Criar Conta
                                    </>
                                )}
                            </Button>

                            {/* Aviso sobre requisitos de senha */}
                            {passwordStrength.score < 4 && formData.password && (
                                <div className="text-center">
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Complete todos os requisitos da senha para continuar
                                    </p>
                                </div>
                            )}
                        </form>

                        <div className="mt-6">
                            <p className="text-xs text-center text-muted-foreground mb-3">
                                Ao criar uma conta, você concorda com nossos{' '}
                                <button
                                    type="button"
                                    onClick={showTerms}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Termos de Uso
                                </button>
                                {' '}e{' '}
                                <button
                                    type="button"
                                    onClick={showTerms}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Política de Privacidade
                                </button>
                            </p>
                            
                            <p className="text-sm text-center text-muted-foreground">
                                Já tem uma conta?{' '}
                                <TextLink href="/login" className="underline hover:no-underline font-medium">
                                    Fazer login
                                </TextLink>
                            </p>
                        </div>
                    </CardContent>
                </div>
            </Card>

            {/* Modal de Termos de Uso */}
            <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
                <DialogContent className="w-[95vw] max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Termos de Uso e Política de Privacidade
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Termos de Uso</h4>
                            <p className="text-muted-foreground">
                                Ao usar nossa plataforma, você concorda em usar nossos serviços de forma responsável 
                                e em conformidade com todas as leis aplicáveis. Não permitimos uso indevido, spam 
                                ou atividades maliciosas.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Política de Privacidade</h4>
                            <p className="text-muted-foreground">
                                Protegemos suas informações pessoais e usamos apenas os dados necessários para 
                                fornecer nossos serviços. Não compartilhamos suas informações com terceiros 
                                sem seu consentimento.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Cookies e Dados</h4>
                            <p className="text-muted-foreground">
                                Utilizamos cookies essenciais para o funcionamento da plataforma e melhorar 
                                sua experiência. Você pode gerenciar suas preferências de cookies a qualquer momento.
                            </p>
                        </div>

                        <div className="pt-4 border-t">
                            <Button
                                onClick={() => setShowTermsModal(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Entendi
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Sessão Expirada */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'session-expired'}
                onClose={closeConfirmModal}
                onConfirm={handleSessionExpired}
                title="Sessão Expirada"
                description="Sua sessão expirou por motivos de segurança. A página será recarregada para estabelecer uma nova conexão segura."
                confirmText="Recarregar Página"
                cancelText="Cancelar"
                type="warning"
                isLoading={confirmModal.isLoading}
            />

            {/* Modal de E-mail Já Existe */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'email-exists'}
                onClose={closeConfirmModal}
                onConfirm={handleEmailExists}
                title="E-mail Já Cadastrado"
                description="Este e-mail já possui uma conta em nossa plataforma. Gostaria de fazer login com esta conta?"
                confirmText="Ir para Login"
                cancelText="Usar Outro E-mail"
                type="info"
                itemName={formData.email}
                isLoading={confirmModal.isLoading}
            />
        </div>
    );
};

// Componente principal com ToastProvider
export default function Register() {
    return (
        <ToastProvider>
            <RegisterContent />
        </ToastProvider>
    );
}