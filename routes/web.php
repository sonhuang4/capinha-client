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
    UploadController
};
// use App\Http\Middleware\{AdminMiddleware}

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

    Route::middleware('auth')->group(function () {
        
        // ... your existing routes ...
        
        // Add QR Code routes
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
        
    });


// Landing Page
Route::get('/', [HomeController::class, 'index'])->name('home');

// Public Card Views
Route::get('/c/{code}', [CardController::class, 'showByCode'])->name('card.view.code');
Route::get('/card/{slug}', [CardController::class, 'publicView'])->name('card.public');

// Card Request System
Route::get('/request', [CardRequestController::class, 'create'])->name('request.form');
Route::post('/request-card', [CardRequestController::class, 'store'])->name('request.store');
Route::get('/request/thanks', [CardRequestController::class, 'thanks'])->name('request.thanks');

// Purchase System
Route::prefix('purchase')->name('purchase.')->group(function () {
    Route::get('/', [PaymentController::class, 'index'])->name('index');
    Route::post('/process', [PaymentController::class, 'process'])->name('process');
    Route::get('/success', [PaymentController::class, 'success'])->name('success');
    Route::post('/webhook', [PaymentController::class, 'webhook'])->name('webhook');
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
            Route::patch('/{id}/toggle-status', [ClientController::class, 'toggleStatus'])->name('toggle-status');
            Route::get('/{id}/analytics', [ClientController::class, 'analytics'])->name('analytics');
        });
        
    });
    
    // Card Creation
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
            // Route::get('/data', [CardController::class, 'analyticsData'])->name('data');
            Route::get('/orders', [CardController::class, 'orderAnalytics'])->name('orders');
        });
        
        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::post('/save', [SettingsController::class, 'save'])->name('save');
            Route::post('/reset', [SettingsController::class, 'reset'])->name('reset');
        });
        
        // Request Management
        Route::prefix('admin/requests')->name('admin.requests.')->group(function () {
            Route::get('/', [CardRequestController::class, 'index'])->name('index');
            Route::get('/{id}', [CardRequestController::class, 'show'])->name('show');
            Route::post('/{id}/convert', [CardRequestController::class, 'convertToCard'])->name('convert');
            Route::put('/{id}/notes', [CardRequestController::class, 'updateNotes'])->name('notes');
            Route::delete('/{id}', [CardRequestController::class, 'destroy'])->name('destroy');
            Route::post('/bulk-action', [CardRequestController::class, 'bulkAction'])->name('bulk');
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