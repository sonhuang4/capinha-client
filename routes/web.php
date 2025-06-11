<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CardController;
use App\Http\Controllers\SettingController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    // Existing card routes
    Route::get('/cards', [CardController::class, 'index']);
    Route::post('/cards', [CardController::class, 'store']);
    Route::put('/cards/{id}', [CardController::class, 'update']);
    Route::put('/cards/{id}/toggle-status', [CardController::class, 'toggleStatus']);
    
    // NEW: Short link and sharing routes
    Route::get('/cards/{id}/short-link', [CardController::class, 'getShortLink']);
    Route::get('/cards/{id}/whatsapp-share', [CardController::class, 'getWhatsAppLink']);
    Route::get('/cards/{id}/email-share', [CardController::class, 'getEmailShare']);
    Route::get('/cards/{id}/sharing-options', [CardController::class, 'getSharingOptions']);
    Route::get('/cards/{id}/send-email', [CardController::class, 'sendEmailToUser']);
});

Route::middleware(['auth', 'verified'])->get('/analytics', function () {
    return Inertia::render('AdminAnalytics');
})->name('analytics');

Route::middleware(['auth', 'verified'])->get('/analytics/data', [CardController::class, 'analytics']);

Route::middleware(['auth', 'verified'])->get('/settings', function () {
    return Inertia::render('AdminSettings');
});

// Public route for viewing cards by code
Route::get('/c/{code}', [CardController::class, 'showByCode']); // public

require __DIR__.'/auth.php';