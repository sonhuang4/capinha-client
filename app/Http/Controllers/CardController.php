<?php
// app/Http/Controllers/Api/CardController.php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index()
    {
        return Card::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'profile_picture' => 'nullable|url',
            'logo' => 'nullable|url',
            'whatsapp' => 'nullable|string',
            'instagram' => 'nullable|string',
            'website' => 'nullable|url',
            'color_theme' => 'nullable|string',
            'status' => 'in:pending,activated',
        ]);

        $validated['code'] = substr(md5(uniqid()), 0, 6);
        $card = Card::create($validated);

        return response()->json($card, 201);
    }

    public function update(Request $request, $id)
    {
        $card = Card::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'profile_picture' => 'nullable|url',
            'logo' => 'nullable|url',
            'whatsapp' => 'nullable|string',
            'instagram' => 'nullable|string',
            'website' => 'nullable|url',
            'color_theme' => 'nullable|string',
            'status' => 'in:pending,activated',
        ]);

        $card->update($validated);
        return response()->json($card);
    }

    public function showByCode($code)
    {
        $card = Card::where('code', $code)->firstOrFail();
        $card->increment('click_count');
        return response()->json($card);
    }

    public function analytics()
{
    $cards = \App\Models\Card::all();

    $totalCards = $cards->count();
    $activeCards = $cards->where('status', 'activated')->count();
    $totalClicks = $cards->sum('click_count');
    $avgClicks = $totalCards > 0 ? round($totalClicks / $totalCards) : 0;

    $clicksByName = $cards->map(fn($card) => [
        'name' => $card->name,
        'clicks' => $card->click_count
    ])->toArray();

    $statusCounts = [
        'activated' => $activeCards,
        'pending' => $totalCards - $activeCards
    ];

    return response()->json([
        'total_cards' => $totalCards,
        'active_cards' => $activeCards,
        'total_clicks' => $totalClicks,
        'avg_clicks' => $avgClicks,
        'clicks_by_name' => $clicksByName,
        'status_counts' => $statusCounts,
    ]);
}

}