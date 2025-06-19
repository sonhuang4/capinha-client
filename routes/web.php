<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\{
    CardController,
    ClientController,
    SettingsController,
    CardRequestController,
    PaymentController,
    HomeController,
    UploadController,
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Public activation routes
Route::prefix('activate')->name('activate.')->group(function () {
    Route::get('/{code}', [ActivationCodeController::class, 'show'])->name('show');
    Route::post('/{code}', [ActivationCodeController::class, 'activate'])->name('process');
});

/*
|--------------------------------------------------------------------------
| Admin Activation Code Management (Authenticated & Verified)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Admin Activation Code Management
    Route::prefix('admin/activation-codes')->name('admin.codes.')->group(function () {
        Route::get('/', [ActivationCodeController::class, 'index'])->name('index');
        Route::post('/', [ActivationCodeController::class, 'store'])->name('store');
        Route::post('/bulk-generate', [ActivationCodeController::class, 'bulkGenerate'])->name('bulk-generate');
        Route::put('/{id}', [ActivationCodeController::class, 'update'])->name('update');
        Route::delete('/{id}', [ActivationCodeController::class, 'destroy'])->name('destroy');
        Route::get('/export', [ActivationCodeController::class, 'export'])->name('export');
    });
    
});

// Landing Page
Route::get('/', [HomeController::class, 'index'])->name('home');

// Public Card Views
Route::get('/c/{code}', [CardController::class, 'showByCode'])->name('card.view.code');
Route::get('/card/{slug}', [CardController::class, 'publicView'])->name('card.public');


///////////////////////////////////////////purchase////////////////////////////////////////////////
Route::prefix('purchase')->name('purchase.')->group(function () {
    // Existing routes...
    Route::get('/', [PaymentController::class, 'index'])->name('index');
    Route::post('/process', [PaymentController::class, 'process'])->name('process');
    Route::get('/success', [PaymentController::class, 'success'])->name('success');
    Route::post('/webhook', [PaymentController::class, 'webhook'])->name('webhook');
    
    // NEW: Add these for PIX payment checking
    Route::post('/pix/check-status', [PaymentController::class, 'checkPaymentStatus'])->name('pix.check');
    
    // TESTING ONLY: Manual payment confirmation (remove in production)
    Route::post('/test/confirm-payment', [PaymentController::class, 'testConfirmPayment'])->name('test.confirm');
});

// Utility Routes
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf.token');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    
    // File Upload
    Route::post('/upload-image', [UploadController::class, 'store'])->name('upload.image');
    
    // Auth Redirect
    Route::get('/auth/redirect', [ClientController::class, 'authRedirect'])->name('auth.redirect');
    
    // QR Code routes (available to all authenticated users)
    Route::get('/card/{slug}/qr', [CardController::class, 'qr'])->name('card.qr');
    Route::get('/cards/{id}/qr', [CardController::class, 'qr'])->name('cards.qr');
    
    // QR download route
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
    
    /*
    |--------------------------------------------------------------------------
    | Client Routes (Regular Users)
    |--------------------------------------------------------------------------
    */
    
    Route::prefix('client')->name('client.')->group(function () {
        
        // Dashboard
        Route::get('/dashboard', [ClientController::class, 'dashboard'])->name('dashboard');
        
        // Card Management
        Route::prefix('cards')->name('cards.')->group(function () {
            Route::get('/{id}/edit', [ClientController::class, 'edit'])->name('edit');
            Route::put('/{id}', [ClientController::class, 'update'])->name('update');
            Route::delete('/{id}', [ClientController::class, 'destroy'])->name('destroy');
            Route::post('/{id}/duplicate', [ClientController::class, 'duplicate'])->name('duplicate');
            Route::post('/{id}/toggle-status', [ClientController::class, 'toggleStatus'])->name('toggle-status');
            Route::get('/{id}/analytics', [ClientController::class, 'analytics'])->name('analytics');
        });
        
    });
    
    // Card Creation (available to all authenticated users)
    Route::get('/create-card', [CardController::class, 'create'])->name('card.create');
    Route::post('/cards/create-client', [CardController::class, 'storeClient'])->name('card.store-client');
    
    // Card Success
    Route::get('/card-success/{slug}', [CardController::class, 'success'])->name('card.success');
    
    /*
    |--------------------------------------------------------------------------
    | Admin Routes (Verified Admins Only)
    |--------------------------------------------------------------------------
    */

    Route::middleware(['verified'])->group(function () {
        
        // Admin Dashboard
        Route::get('/dashboard', [CardController::class, 'adminDashboard'])->name('dashboard');
        Route::get('/admin/analytics', function() {
            return inertia('AdminAnalytics');
        })->name('admin.analytics');

        Route::get('/analytics/data', [CardController::class, 'analytics'])->name('analytics.data');

        // ADD THIS: Admin Payment Management Routes
        Route::prefix('admin/payments')->name('admin.payments.')->group(function () {
            Route::get('/', [PaymentController::class, 'adminIndex'])->name('index');
            Route::post('/{id}/confirm', [PaymentController::class, 'adminConfirmPayment'])->name('confirm');
            Route::post('/{id}/refund', [PaymentController::class, 'refund'])->name('refund');
            Route::get('/export', [PaymentController::class, 'exportPayments'])->name('export');
        });
        
        // Card Management (Admin)
        Route::prefix('cards')->name('cards.')->group(function () {
            Route::get('/', [CardController::class, 'index'])->name('index');
            Route::post('/', [CardController::class, 'store'])->name('store');
            Route::put('/{id}', [CardController::class, 'update'])->name('update');
            Route::delete('/{id}', [CardController::class, 'destroy'])->name('destroy');
            Route::put('/{id}/toggle-status', [CardController::class, 'toggleStatus'])->name('toggle');
            Route::get('/{id}/qr', [CardController::class, 'qr'])->name('qr');
            Route::get('/{id}/analytics', [CardController::class, 'analytics'])->name('analytics');
        });
        
        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [CardController::class, 'analyticsIndex'])->name('index');
            Route::get('/orders', [CardController::class, 'orderAnalytics'])->name('orders');
        });
        
        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::post('/save', [SettingsController::class, 'save'])->name('save');
            Route::post('/reset', [SettingsController::class, 'reset'])->name('reset');
        });
        
        // User Management (Admin)
        Route::prefix('admin/users')->name('admin.users.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('index');
            Route::get('/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->name('show');
            Route::post('/{user}/status', [\App\Http\Controllers\Admin\UserController::class, 'updateStatus'])->name('update-status');
            Route::post('/{user}/role', [\App\Http\Controllers\Admin\UserController::class, 'updateRole'])->name('update-role');
            Route::delete('/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('destroy');
            Route::post('/bulk-action', [\App\Http\Controllers\Admin\UserController::class, 'bulkAction'])->name('bulk-action');
            Route::get('/export/csv', [\App\Http\Controllers\Admin\UserController::class, 'export'])->name('export');
        });
        
        // Card Activations (Admin) - FIXED
        Route::prefix('admin/cards')->name('admin.cards.')->group(function () {
            Route::get('/{card}/activations', [CardController::class, 'showActivations'])
                ->name('activations');
            
            Route::get('/{card}/activations/export', [CardController::class, 'exportActivations'])
                ->name('activations.export');
        });
        
        // Order Management
        Route::prefix('admin/orders')->name('admin.orders.')->group(function () {
            Route::get('/', [CardController::class, 'ordersIndex'])->name('index');
            Route::post('/bulk-action', [CardController::class, 'bulkOrderAction'])->name('bulk');
            Route::put('/{id}/payment-status', [CardController::class, 'updatePaymentStatus'])->name('payment-status');
            Route::post('/{id}/set-expiry', [CardController::class, 'setExpiryDate'])->name('set-expiry');
            Route::post('/{id}/extend-expiry', [CardController::class, 'extendExpiry'])->name('extend-expiry');
            Route::post('/bulk-activate', [CardController::class, 'bulkActivate'])->name('bulk-activate');
        });
        
    });
    
});

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';