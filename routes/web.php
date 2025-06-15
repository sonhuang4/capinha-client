<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\CardController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\CardRequestController;
use App\Models\Card;
use App\Models\Activation;
use Symfony\Component\HttpFoundation\StreamedResponse;

// 🌐 Public routes
Route::get('/', fn () => Inertia::render('LandingPage'));
Route::get('/request', fn () => Inertia::render('RequestCardForm'));
Route::get('/request/thanks', fn () => Inertia::render('RequestThanks'));

Route::post('/request-card', [CardController::class, 'storePublicRequest']);
Route::get('/c/{code}', fn ($code) => Inertia::render('PublicCardView', ['code' => $code]));
Route::get('/cards/by-code/{code}', function ($code) {
    $card = Card::where('code', $code)->first();
    if (!$card || $card->status !== 'activated') {
        return response()->json(['message' => 'Card not found'], 404);
    }
    $card->increment('click_count');
    return response()->json($card);
});

// ⛔ Client-only dashboard (optional auth check)
Route::middleware(['auth'])->get('/client/dashboard', function () {
    $user = Auth::user();
    $card = $user->cards()->latest()->first();
    return Inertia::render('ClientDashboard', [
        'card' => $card ? $card->only(['id', 'name', 'code', 'click_count', 'profile_picture']) : null
    ]);
});

// 🧠 Smart redirect after login (admin vs client)
Route::middleware(['auth'])->get('/auth/redirect', function () {
    $user = Auth::user();
    return $user->role === 'admin'
        ? redirect('/dashboard')
        : redirect('/request');
});

// ⚙️ Admin dashboard and tools (manual role check)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Access denied');
        }
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/cards', function () {
        if (auth()->user()->role !== 'admin') abort(403);
        return app(CardController::class)->index();
    });

    Route::post('/cards', [CardController::class, 'store']);
    Route::put('/cards/{id}', [CardController::class, 'update']);
    Route::put('/cards/{id}/toggle-status', [CardController::class, 'toggleStatus']);

    Route::get('/cards/{id}/short-link', [CardController::class, 'getShortLink']);
    Route::get('/cards/{id}/whatsapp-share', [CardController::class, 'getWhatsAppLink']);
    Route::get('/cards/{id}/email-share', [CardController::class, 'getEmailShare']);
    Route::get('/cards/{id}/sharing-options', [CardController::class, 'getSharingOptions']);
    Route::get('/cards/{id}/send-email', [CardController::class, 'sendEmailToUser']);

    Route::get('/analytics', fn () => Inertia::render('AdminAnalytics'))->name('analytics');
    Route::get('/analytics/data', [CardController::class, 'analytics']);

    Route::get('/settings', fn () => Inertia::render('AdminSettings'));
    Route::get('/admin/requests', [CardRequestController::class, 'index']);
});

// 📦 Card activation and QR tools
Route::post('/cards/{id}/activate', function ($id) {
    Activation::create([
        'card_id' => $id,
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
    ]);
    return response()->json(['success' => true]);
});

Route::get('/cards/{id}/qr', function ($id) {
    $card = Card::findOrFail($id);
    return Inertia::render('CardQRCode', [
        'card' => [
            'id' => $card->id,
            'name' => $card->name,
            'code' => $card->code,
        ]
    ]);
});

Route::get('/cards/{id}/activations', function ($id) {
    $card = Card::with(['activations' => fn($q) => $q->latest()])->findOrFail($id);
    return Inertia::render('CardActivations', [
        'card' => [
            'id' => $card->id,
            'name' => $card->name,
            'activations' => $card->activations->map(fn($a) => [
                'id' => $a->id,
                'ip_address' => $a->ip_address,
                'user_agent' => $a->user_agent,
                'created_at' => $a->created_at->format('d/m/Y H:i'),
            ])
        ]
    ]);
});

Route::get('/cards/{id}/activations/export', function ($id) {
    $card = Card::with('activations')->findOrFail($id);
    $filename = 'ativacoes_card_' . $card->id . '.csv';
    $headers = [
        'Content-Type' => 'text/csv',
        'Content-Disposition' => "attachment; filename=\"$filename\"",
    ];
    $columns = ['Data', 'IP', 'User-Agent'];

    return new StreamedResponse(function () use ($card, $columns) {
        $handle = fopen('php://output', 'w');
        fputcsv($handle, $columns);
        foreach ($card->activations as $a) {
            fputcsv($handle, [
                $a->created_at->format('Y-m-d H:i:s'),
                $a->ip_address,
                $a->user_agent,
            ]);
        }
        fclose($handle);
    }, 200, $headers);
});

// 📥 Create card form (admin only)
Route::get('/cards/create', [CardController::class, 'create'])->middleware(['auth']);
require __DIR__ . '/auth.php';
