<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page
     */
    public function create(): Response
    {
        return Inertia::render('auth/login');
    }

    /**
     * Show the registration page
     */
    public function showRegister(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle login request
     */
    public function store(LoginRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();
            $remember = $request->boolean('remember');

            // Find user by email
            $user = User::where('email', $credentials['email'])->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'These credentials do not match our records.',
                    'errors' => [
                        'email' => ['These credentials do not match our records.']
                    ]
                ], 422);
            }

            // Verify password
            if (!Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided password is incorrect.',
                    'errors' => [
                        'password' => ['The provided password is incorrect.']
                    ]
                ], 422);
            }

            // Check if user is active (if you have user status)
            if (method_exists($user, 'isActive') && !$user->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated. Please contact support.',
                    'errors' => [
                        'email' => ['Your account has been deactivated.']
                    ]
                ], 422);
            }

            // Login successful
            Auth::login($user, $remember);
            $request->session()->regenerate();

            // Determine redirect URL based on role
            $redirectUrl = $this->getRedirectUrl($user);

            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'redirect' => $redirectUrl,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'role' => $user->role
            ]);

        } catch (\Exception $e) {
            Log::error('Login error', [
                'error' => $e->getMessage(),
                'email' => $request->email ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login. Please try again.',
            ], 500);
        }
    }

    /**
     * Handle registration request
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            // Double-check if user exists (additional safety)
            if (User::where('email', $data['email'])->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This email is already registered.',
                    'errors' => [
                        'email' => ['This email is already registered.']
                    ]
                ], 422);
            }

            // Create new user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'client', // Default role
                'email_verified_at' => null, // Set to null initially
            ]);

            // Auto-login after registration
            Auth::login($user);
            $request->session()->regenerate();

            // Determine redirect URL
            $redirectUrl = $this->getRedirectUrl($user);

            Log::info('User registered successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Welcome aboard!',
                'redirect' => $redirectUrl,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'role' => $user->role
            ]);

        } catch (\Exception $e) {
            Log::error('Registration error', [
                'error' => $e->getMessage(),
                'email' => $request->email ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during registration. Please try again.',
            ], 500);
        }
    }

    /**
     * Handle logout
     */
    public function destroy(Request $request)
    {
        try {
            $user = Auth::user();
            
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($user) {
                Log::info('User logged out', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
            }

            // Check if request expects JSON (for API calls)
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Logged out successfully.',
                    'redirect' => '/'
                ]);
            }

            // For Inertia requests, redirect properly
            return redirect('/')->with('message', 'Logged out successfully.');

        } catch (\Exception $e) {
            Log::error('Logout error', ['error' => $e->getMessage()]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred during logout.',
                ], 500);
            }

            return back()->withErrors(['error' => 'An error occurred during logout.']);
        }
    }

    /**
     * Get redirect URL based on user role
     */
    private function getRedirectUrl(User $user): string
    {
        return match ($user->role) {
            'admin' => '/dashboard',
            'client' => '/client/dashboard',
            default => '/client/dashboard',
        };
    }
}