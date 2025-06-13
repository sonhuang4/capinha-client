<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CardController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\CardRequestController;

Route::get('/', function () {
    return Inertia::render('LandingPage'); // 
});
Route::get('/request', fn () => Inertia::render('RequestCardForm'));
Route::get('/request/thanks', fn () => Inertia::render('RequestThanks'));

Route::get('/cards/create', [CardController::class, 'create'])->middleware(['auth']);

Route::get('/c/{code}', [CardController::class, 'showByCode']);
Route::post('/request-card', [CardController::class, 'storePublicRequest']);

// 🔐 Authenticated admin routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Admin dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Cards management
    Route::get('/cards', [CardController::class, 'index']);
    Route::post('/cards', [CardController::class, 'store']);
    Route::put('/cards/{id}', [CardController::class, 'update']);
    Route::put('/cards/{id}/toggle-status', [CardController::class, 'toggleStatus']);
    Route::get('/cards/{id}/short-link', [CardController::class, 'getShortLink']);
    Route::get('/cards/{id}/whatsapp-share', [CardController::class, 'getWhatsAppLink']);
    Route::get('/cards/{id}/email-share', [CardController::class, 'getEmailShare']);
    Route::get('/cards/{id}/sharing-options', [CardController::class, 'getSharingOptions']);
    Route::get('/cards/{id}/send-email', [CardController::class, 'sendEmailToUser']);
    Route::middleware(['auth'])->get('/admin/requests', [CardRequestController::class, 'index']);

    // Admin analytics
    Route::get('/analytics', function () {
        return Inertia::render('AdminAnalytics');
    })->name('analytics');
    Route::get('/analytics/data', [CardController::class, 'analytics']);

    // Admin settings
    Route::get('/settings', function () {
        return Inertia::render('AdminSettings');
    });
});

// Auth routes (login, register, password reset, etc.)
require __DIR__.'/auth.php';
