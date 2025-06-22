import { Head } from '@inertiajs/react';
import { UserPlus, LoaderCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { useState, FormEvent, useCallback, useMemo } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';

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

export default function Register() {
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
            newErrors.name = ['Full name is required.'];
        } else if (formData.name.trim().length < 2) {
            newErrors.name = ['Name must be at least 2 characters.'];
        }

        if (!formData.email.trim()) {
            newErrors.email = ['Email address is required.'];
        } else if (!validateEmail(formData.email)) {
            newErrors.email = ['Please enter a valid email address.'];
        }

        if (!formData.password) {
            newErrors.password = ['Password is required.'];
        } else if (!passwordStrength.checks.length) {
            newErrors.password = ['Password must be at least 6 characters.'];
        } else if (!passwordStrength.checks.uppercase) {
            newErrors.password = ['Password must contain at least one uppercase letter.'];
        } else if (!passwordStrength.checks.lowercase) {
            newErrors.password = ['Password must contain at least one lowercase letter.'];
        } else if (!passwordStrength.checks.number) {
            newErrors.password = ['Password must contain at least one number.'];
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = ['Password confirmation is required.'];
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = ['Password confirmation does not match.'];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getCsrfToken = async (): Promise<string> => {
        // Ensure fresh CSRF token
        await fetch('/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'same-origin'
        });

        // Wait for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Try to get token from meta tag first
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // If not found, try cookie
        if (!csrfToken) {
            const cookies = document.cookie.split(';');
            const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
            if (xsrfCookie) {
                csrfToken = decodeURIComponent(xsrfCookie.split('=')[1]);
            }
        }

        if (!csrfToken) {
            throw new Error('CSRF token not available');
        }

        return csrfToken;
    };

    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

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
                // Success
                const redirectUrl = data.redirect || '/client/dashboard';
                window.location.href = redirectUrl;
            } else {
                // Handle errors
                if (response.status === 419) {
                    // CSRF token mismatch
                    window.location.reload();
                    return;
                }

                if (data.errors) {
                    setErrors(data.errors);
                } else if (data.message) {
                    setErrors({ email: [data.message] });
                } else {
                    setErrors({ email: ['An error occurred. Please try again.'] });
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ email: ['Network error. Please check your connection and try again.'] });
        } finally {
            setIsLoading(false);
        }
    }, [formData, isLoading]);

    const handleChange = (field: keyof RegisterForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear errors when user starts typing
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
        if (score < 2) return 'Weak';
        if (score < 4) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <Head title="Sign Up" />
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
                            Create Account
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter your information to create your account
                        </p>
                    </div>

                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                    className="mt-1"
                                />
                                <InputError message={errors.name?.[0]} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    required
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                    className="mt-1"
                                />
                                <InputError message={errors.email?.[0]} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        placeholder="Create a strong password"
                                        disabled={isLoading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                
                                {formData.password && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Password strength:</span>
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
                                                { key: 'length', text: 'At least 6 characters' },
                                                { key: 'uppercase', text: 'One uppercase letter' },
                                                { key: 'lowercase', text: 'One lowercase letter' },
                                                { key: 'number', text: 'One number' }
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
                                    Confirm Password
                                </Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
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
                                            {passwordStrength.checks.match ? 'Passwords match' : 'Passwords do not match'}
                                        </span>
                                    </div>
                                )}
                                <InputError message={errors.password_confirmation?.[0]} className="mt-1" />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                                disabled={isLoading || passwordStrength.score < 4}
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <p className="mt-6 text-sm text-center text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href="/login" className="underline hover:no-underline font-medium">
                                Sign in
                            </TextLink>
                        </p>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}