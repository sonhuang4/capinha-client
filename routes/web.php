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
    Route::get('/cards', [CardController::class, 'index']);
    Route::post('/cards', [CardController::class, 'store']);
    Route::put('/cards/{id}', [CardController::class, 'update']);
    // Route::get('/analytics', [CardController::class, 'analytics']);
    // Route::get('/analytics', fn() => Inertia::render('AdminAnalytics'))->middleware('auth');
});

Route::middleware(['auth', 'verified'])->get('/analytics', function () {
    return Inertia::render('AdminAnalytics');
})->name('analytics');

Route::middleware(['auth', 'verified'])->get('/analytics/data', [CardController::class, 'analytics']);

Route::middleware(['auth', 'verified'])->get('/settings', function () {
    return Inertia::render('AdminSettings');
});

// Route::middleware(['auth'])->group(function () {
//     Route::get('/settings', [SettingController::class, 'get'])->name('settings');
//     Route::post('/settings/save', [SettingController::class, 'save']);
//     Route::post('/settings/reset', [SettingController::class, 'reset']);
// });

Route::get('/c/{code}', [CardController::class, 'showByCode']); // public

// require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
