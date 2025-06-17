<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\CardController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\CardRequestController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ClientController;
use App\Models\Card;
use App\Models\Activation;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Storage;

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

// Landing and Public Pages
Route::get('/', fn () => Inertia::render('LandingPage'))->name('home');
Route::get('/request', fn () => Inertia::render('RequestCardForm'))->name('request.form');
Route::get('/request/thanks', fn () => Inertia::render('RequestThanks'))->name('request.thanks');

// Public Card Request Submission
Route::post('/request-card', [CardRequestController::class, 'store'])->name('request.store');

// Public Card Views
Route::get('/c/{code}', [CardController::class, 'showByCode'])->name('card.view.code');
Route::get('/card/{slug}', [CardController::class, 'publicView'])->name('card.public');

// Card Data API (for frontend)
Route::get('/cards/by-code/{code}', function ($code) {
    $card = Card::where('code', $code)->first();
    if (!$card || $card->status !== 'activated') {
        return response()->json(['message' => 'Card not found'], 404);
    }
    $card->increment('click_count');
    return response()->json($card);
})->name('card.api');

// Purchase System (Public)
Route::get('/purchase', fn () => Inertia::render('Purchase'))->name('purchase');
Route::post('/purchase/process', [PaymentController::class, 'process'])->name('purchase.process');
Route::get('/purchase/success', [PaymentController::class, 'success'])->name('purchase.success');
Route::post('/purchase/webhook', [PaymentController::class, 'webhook'])->name('purchase.webhook');

// Image upload endpoint - Available for card creation (both authenticated and public)
Route::post('/upload-image', function (Request $request) {
    try {
        // Log the incoming request
        \Log::info('Upload request received', [
            'has_file' => $request->hasFile('file'),
            'file_size' => $request->hasFile('file') ? $request->file('file')->getSize() : null,
            'file_type' => $request->hasFile('file') ? $request->file('file')->getMimeType() : null,
            'type' => $request->input('type'),
            'user_id' => auth()->id(),
            'ip' => $request->ip()
        ]);

        // Validate the request
        $request->validate([
            'file' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'type' => 'required|in:profile,logo'
        ]);

        $file = $request->file('file');
        $type = $request->input('type');
        
        // Ensure directory exists
        $uploadPath = storage_path('app/public/uploads/' . $type);
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
            \Log::info('Created directory: ' . $uploadPath);
        }
        
        // Generate unique filename
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        // Store file with custom name
        $path = $file->storeAs('uploads/' . $type, $filename, 'public');
        $url = asset('storage/' . $path);

        \Log::info('Upload successful', [
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => $filename,
            'path' => $path,
            'url' => $url,
            'file_size' => $file->getSize()
        ]);

        return response()->json([
            'success' => true,
            'url' => $url,
            'filename' => $filename,
            'size' => $file->getSize()
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Upload validation failed', [
            'errors' => $e->errors(),
            'input' => $request->except(['file'])
        ]);
        
        $errorMessage = 'Erro de validação: ';
        foreach ($e->errors() as $field => $messages) {
            $errorMessage .= implode(', ', $messages) . ' ';
        }
        
        return response()->json([
            'success' => false,
            'message' => trim($errorMessage),
            'errors' => $e->errors()
        ], 422);
        
    } catch (\Exception $e) {
        \Log::error('Upload failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'file_info' => $request->hasFile('file') ? [
                'size' => $request->file('file')->getSize(),
                'type' => $request->file('file')->getMimeType(),
                'name' => $request->file('file')->getClientOriginalName()
            ] : null
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erro interno: ' . $e->getMessage()
        ], 500);
    }
})->name('upload.image');

// Debug route to check storage setup
Route::get('/debug-storage', function () {
    $storagePath = storage_path('app/public');
    $publicStoragePath = public_path('storage');
    
    return response()->json([
        'storage_path' => $storagePath,
        'storage_exists' => is_dir($storagePath),
        'storage_writable' => is_writable($storagePath),
        'public_storage_path' => $publicStoragePath,
        'public_storage_exists' => is_dir($publicStoragePath),
        'symlink_exists' => is_link($publicStoragePath),
        'uploads_path' => $storagePath . '/uploads',
        'uploads_exists' => is_dir($storagePath . '/uploads'),
        'profile_path' => $storagePath . '/uploads/profile',
        'profile_exists' => is_dir($storagePath . '/uploads/profile'),
        'logo_path' => $storagePath . '/uploads/logo',
        'logo_exists' => is_dir($storagePath . '/uploads/logo'),
    ]);
})->name('debug.storage');

// ========================================
// AUTHENTICATED ROUTES
// ========================================

Route::middleware(['auth'])->group(function () {
    
    // Smart Redirect After Login
    Route::get('/auth/redirect', function () {
        $user = Auth::user();
        return $user->role === 'admin'
            ? redirect()->route('dashboard')
            : redirect()->route('client.dashboard');
    })->name('auth.redirect');

    // ========================================
    // CLIENT ROUTES (Regular Users)
    // ========================================
    
    Route::prefix('client')->name('client.')->group(function () {
        
        // Main Client Dashboard - shows all user's cards
        Route::get('/dashboard', [ClientController::class, 'dashboard'])->name('dashboard');
        
        // Card Management Routes
        Route::prefix('cards')->name('cards.')->group(function () {
            
            // Edit specific card
            Route::get('/{id}/edit', [ClientController::class, 'editCard'])->name('edit');
            
            // Update specific card
            Route::put('/{id}', [ClientController::class, 'updateCard'])->name('update');
            
            // Delete specific card
            Route::delete('/{id}', [ClientController::class, 'deleteCard'])->name('destroy');
            
            // Duplicate specific card
            Route::post('/{id}/duplicate', [ClientController::class, 'duplicateCard'])->name('duplicate');
            
            // Toggle card status (active/inactive)
            Route::patch('/{id}/toggle-status', [ClientController::class, 'toggleCardStatus'])->name('toggle-status');
            
            // Get analytics for specific card
            Route::get('/{id}/analytics', [ClientController::class, 'getCardAnalytics'])->name('analytics');
            
        });
        
        // LEGACY ROUTES (for backward compatibility with existing code)
        Route::get('/my-card', [ClientController::class, 'showMyCard'])->name('my-card');
        Route::put('/my-card', [ClientController::class, 'updateMyCard'])->name('my-card.update');
        Route::get('/analytics', [ClientController::class, 'analytics'])->name('analytics');
        Route::get('/qr', [ClientController::class, 'generateQR'])->name('qr');
        Route::get('/qr/download', [ClientController::class, 'downloadQR'])->name('qr.download');
        Route::get('/share-options', [ClientController::class, 'getShareOptions'])->name('share-options');
        
    });

    // Card Creation Routes
    Route::get('/create-card', [CardController::class, 'create'])->name('card.create');
    Route::post('/cards/create-client', [CardController::class, 'storeClient'])->name('card.store-client');
    
    // Card Success and QR Routes
    Route::get('/card-success/{slug}', [CardController::class, 'success'])->name('card.success');
    Route::get('/card/{slug}/qr', [CardController::class, 'generateQR'])->name('card.qr');
    Route::get('/card/{slug}/qr/download', function($slug) {
        $card = \App\Models\Card::where('unique_slug', $slug)->firstOrFail();
        $cardUrl = route('card.public', $slug);
        
        return response()->json([
            'success' => true,
            'qr_data' => $cardUrl,
            'card_name' => $card->name,
            'download_url' => $cardUrl,
            'message' => 'QR code data for: ' . $card->name
        ]);
    })->name('card.qr.download');

    // Debug route for dashboard data
    Route::get('/debug-dashboard', function () {
        $user = Auth::user();
        $cards = $user->cards;
        
        return response()->json([
            'user' => $user,
            'cards' => $cards,
            'cards_count' => $cards->count(),
            'relationships_loaded' => $user->relationLoaded('cards'),
            'user_has_cards_method' => method_exists($user, 'cards'),
            'card_sample' => $cards->first()
        ]);
    })->name('debug.dashboard');
    
    // ========================================
    // ADMIN ROUTES (Verified Admin Users Only)
    // ========================================
    
    Route::middleware(['verified'])->group(function () {
        
        // Admin Dashboard
        Route::get('/dashboard', function () {
            if (auth()->user()->role !== 'admin') {
                abort(403, 'Access denied');
            }
            return Inertia::render('dashboard');
        })->name('dashboard');
        
        // Card CRUD Operations (Admin)
        Route::get('/cards', function () {
            if (auth()->user()->role !== 'admin') abort(403);
            return app(CardController::class)->index();
        })->name('cards.index');
        
        Route::post('/cards', [CardController::class, 'store'])->name('cards.store');
        Route::put('/cards/{id}', [CardController::class, 'update'])->name('cards.update');
        Route::delete('/cards/{id}', [CardController::class, 'destroy'])->name('cards.destroy'); 
        Route::put('/cards/{id}/toggle-status', [CardController::class, 'toggleStatus'])->name('cards.toggle');

        // Card Sharing Features (Admin)
        Route::get('/cards/{id}/short-link', [CardController::class, 'getShortLink'])->name('cards.short-link');
        Route::get('/cards/{id}/whatsapp-share', [CardController::class, 'getWhatsAppLink'])->name('cards.whatsapp');
        Route::get('/cards/{id}/email-share', [CardController::class, 'getEmailShare'])->name('cards.email');
        Route::get('/cards/{id}/sharing-options', [CardController::class, 'getSharingOptions'])->name('cards.sharing');
        Route::get('/cards/{id}/send-email', [CardController::class, 'sendEmailToUser'])->name('cards.send-email');
        
        // Analytics (Admin)
        Route::get('/analytics', fn () => Inertia::render('AdminAnalytics'))->name('analytics');
        Route::get('/analytics/data', [CardController::class, 'analytics'])->name('analytics.data');
        Route::get('/analytics/orders', [CardController::class, 'orderAnalytics'])->name('analytics.orders');
        
        // Settings Pages (Admin)
        Route::get('/admin/settings', fn () => Inertia::render('AdminSettings'))->name('AdminSettings');
        Route::get('/settings', fn () => Inertia::render('AdminSettings'))->name('AdminSettings');
        
        // Settings API (Admin)
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings/save', [SettingsController::class, 'save'])->name('settings.save');
        Route::post('/settings/reset', [SettingsController::class, 'reset'])->name('settings.reset');
        
        // Admin Request Management
        Route::prefix('admin/requests')->name('admin.requests.')->group(function () {
            Route::get('/', [CardRequestController::class, 'index'])->name('index');
            Route::get('/{id}', [CardRequestController::class, 'show'])->name('show');
            Route::post('/{id}/convert', [CardRequestController::class, 'convertToCard'])->name('convert');
            Route::put('/{id}/notes', [CardRequestController::class, 'updateNotes'])->name('notes');
            Route::delete('/{id}', [CardRequestController::class, 'destroy'])->name('destroy');
            Route::post('/bulk-action', [CardRequestController::class, 'bulkAction'])->name('bulk');
        });

        // Legacy request route (for compatibility)
        Route::get('/admin/requests', [CardRequestController::class, 'index'])->name('requests');
        
        // Enhanced Order Management (Admin)
        Route::prefix('admin/orders')->name('admin.orders.')->group(function () {
            Route::get('/', [CardController::class, 'indexWithOrders'])->name('index');
            Route::post('/bulk-action', [CardController::class, 'bulkOrderAction'])->name('bulk');
            Route::put('/{id}/payment-status', [CardController::class, 'updatePaymentStatus'])->name('payment-status');
            Route::post('/{id}/set-expiry', [CardController::class, 'setExpiryDate'])->name('set-expiry');
            Route::post('/{id}/extend-expiry', [CardController::class, 'extendExpiry'])->name('extend-expiry');
            Route::post('/bulk-activate', [CardController::class, 'bulkActivate'])->name('bulk-activate');
        });
        
        // Card Activation Tracking (Admin)
        Route::post('/cards/{id}/activate', function ($id) {
            try {
                Activation::create([
                    'card_id' => $id,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
                return response()->json(['success' => true]);
            } catch (\Exception $e) {
                \Log::error('Activation tracking failed: ' . $e->getMessage());
                return response()->json(['success' => false], 500);
            }
        })->name('cards.activate');

        // QR Code Generation (Admin)
        Route::get('/cards/{id}/qr', function ($id) {
            $card = Card::findOrFail($id);
            return Inertia::render('CardQRCode', [
                'card' => [
                    'id' => $card->id,
                    'name' => $card->name,
                    'code' => $card->code,
                    'unique_slug' => $card->unique_slug,
                ]
            ]);
        })->name('cards.qr');

        // Activation History (Admin)
        Route::get('/cards/{id}/activations', function ($id) {
            $card = Card::with(['activations' => fn($q) => $q->latest()])->findOrFail($id);
            return Inertia::render('CardActivations', [
                'card' => [
                    'id' => $card->id,
                    'name' => $card->name,
                    'total_activations' => $card->activations->count(),
                    'activations' => $card->activations->map(fn($a) => [
                        'id' => $a->id,
                        'ip_address' => $a->ip_address,
                        'user_agent' => $a->user_agent,
                        'created_at' => $a->created_at->format('d/m/Y H:i'),
                        'date_formatted' => $a->created_at->format('d/m/Y'),
                        'time_formatted' => $a->created_at->format('H:i'),
                    ])
                ]
            ]);
        })->name('cards.activations');

        // Export Activations (Admin)
        Route::get('/cards/{id}/activations/export', function ($id) {
            $card = Card::with('activations')->findOrFail($id);
            $filename = 'ativacoes_card_' . $card->id . '_' . now()->format('Y-m-d') . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ];

            return new StreamedResponse(function () use ($card) {
                $handle = fopen('php://output', 'w');
                
                // Add BOM for UTF-8
                fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
                
                // Headers
                fputcsv($handle, ['Data', 'Hora', 'IP', 'User-Agent', 'Dispositivo'], ';');
                
                // Data
                foreach ($card->activations as $activation) {
                    $deviceType = 'Desktop';
                    $userAgent = strtolower($activation->user_agent ?? '');
                    
                    if (strpos($userAgent, 'mobile') !== false || strpos($userAgent, 'android') !== false) {
                        $deviceType = 'Mobile';
                    } elseif (strpos($userAgent, 'tablet') !== false || strpos($userAgent, 'ipad') !== false) {
                        $deviceType = 'Tablet';
                    }
                    
                    fputcsv($handle, [
                        $activation->created_at->format('d/m/Y'),
                        $activation->created_at->format('H:i:s'),
                        $activation->ip_address,
                        $activation->user_agent,
                        $deviceType
                    ], ';');
                }
                fclose($handle);
            }, 200, $headers);
        })->name('cards.activations.export');

    }); // End verified middleware

}); // End auth middleware

// Legacy card creation route (for compatibility)
Route::get('/cards/create', [CardController::class, 'create'])->middleware(['auth'])->name('cards.create.legacy');

// Auth routes (login, register, etc.)
require __DIR__ . '/auth.php';