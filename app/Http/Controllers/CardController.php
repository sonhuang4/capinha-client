<?php
// app/Http/Controllers/Api/CardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    // GET /api/cards - List all cards (admin only)
    public function index()
    {
        $cards = Card::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($cards);
    }

    // POST /api/cards - Create new card (admin only)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'whatsapp' => 'nullable|url',
            'instagram' => 'nullable|url',
            'linkedin' => 'nullable|url',
            'website' => 'nullable|url',
            'facebook' => 'nullable|url',
            'bio' => 'nullable|string|max:500',
            'address' => 'nullable|string|max:255',
        ]);

        // Auto-generate code if not provided
        $validated['code'] = Card::generateUniqueCode();
        $validated['status'] = 'pending';

        $card = Card::create($validated);

        return response()->json([
            'message' => 'Card created successfully',
            'card' => $card,
            'public_url' => $card->getPublicUrl()
        ], 201);
    }

    // GET /api/cards/{id} - Get card details (admin only)
    public function show(Card $card)
    {
        return response()->json([
            'card' => $card->load('user')
        ]);
    }

    // PUT /api/cards/{id} - Update card (admin only)
    public function update(Request $request, Card $card)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'whatsapp' => 'nullable|url',
            'instagram' => 'nullable|url',
            'linkedin' => 'nullable|url',
            'website' => 'nullable|url',
            'facebook' => 'nullable|url',
            'bio' => 'nullable|string|max:500',
            'address' => 'nullable|string|max:255',
            'status' => 'in:pending,active,blocked',
        ]);

        $card->update($validated);

        return response()->json([
            'message' => 'Card updated successfully',
            'card' => $card
        ]);
    }

    // DELETE /api/cards/{id} - Delete card (admin only)
    public function destroy(Card $card)
    {
        $card->delete();

        return response()->json([
            'message' => 'Card deleted successfully'
        ]);
    }

    // GET /api/c/{code} - Public card display (no auth needed)
    public function showByCode($code)
    {
        $card = Card::where('code', $code)
            ->where('status', 'active')
            ->first();

        if (!$card) {
            return response()->json([
                'error' => 'Card not found or not active'
            ], 404);
        }

        // Log the visit (we'll create this later)
        // $this->logCardVisit($card, request());

        return response()->json([
            'name' => $card->name,
            'company_name' => $card->company_name,
            'job_title' => $card->job_title,
            'phone' => $card->phone,
            'email' => $card->email,
            'whatsapp' => $card->whatsapp,
            'instagram' => $card->instagram,
            'linkedin' => $card->linkedin,
            'website' => $card->website,
            'facebook' => $card->facebook,
            'photo_url' => $card->photo_url,
            'logo_url' => $card->logo_url,
            'bio' => $card->bio,
            'address' => $card->address,
        ]);
    }
}