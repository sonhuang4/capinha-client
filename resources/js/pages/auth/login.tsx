import { Head } from '@inertiajs/react';
import { LogIn, LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { useState, FormEvent, useCallback } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedBackground from '@/components/AnimatedBackground';
import ThemeToggle from '@/components/ThemeToggle';

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

export default function Login() {
    const [formData, setFormData] = useState<LoginForm>({
        email: '',
        password: '',
        remember: false
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<LoginError>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            setErrors({ email: ['Email address is required.'] });
            return false;
        }

        if (!validateEmail(formData.email)) {
            setErrors({ email: ['Please enter a valid email address.'] });
            return false;
        }

        if (!formData.password) {
            setErrors({ password: ['Password is required.'] });
            return false;
        }

        return true;
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
            console.error('Login error:', error);
            setErrors({ email: ['Network error. Please check your connection and try again.'] });
        } finally {
            setIsLoading(false);
        }
    }, [formData, isLoading]);

    const handleChange = (field: keyof LoginForm, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear errors when user starts typing
        if (errors[field as keyof LoginError]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <Head title="Sign In" />
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
                            Sign In
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
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
                                        Remember me
                                    </Label>
                                </div>

                                <TextLink 
                                    href="/forgot-password" 
                                    className="text-sm underline hover:no-underline"
                                >
                                    Forgot password?
                                </TextLink>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <p className="mt-6 text-sm text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink href="/register" className="underline hover:no-underline font-medium">
                                Sign up
                            </TextLink>
                        </p>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}