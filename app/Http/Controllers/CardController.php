<?php
// app/Http/Controllers/CardController.php

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

    public function toggleStatus($id)
    {
        $card = Card::findOrFail($id);
        $card->status = ($card->status === 'activated') ? 'pending' : 'activated';
        $card->save();

        return response()->json($card);
    }

    // NEW: Get short link for a card
    public function getShortLink($id)
    {
        $card = Card::findOrFail($id);
        
        // Generate short link URL
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/card/' . $card->code;
        
        return response()->json([
            'short_link' => $shortLink,
            'code' => $card->code,
            'card_name' => $card->name
        ]);
    }

    // NEW: Get WhatsApp share link
    public function getWhatsAppLink($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/card/' . $card->code;
        
        // WhatsApp message template
        $message = "👋 Hi! Check out my digital business card: " . $shortLink;
        $whatsappUrl = "https://api.whatsapp.com/send/?text=" . urlencode($message);
        
        return response()->json([
            'whatsapp_url' => $whatsappUrl,
            'message' => $message,
            'short_link' => $shortLink
        ]);
    }

    // NEW: Get email share content
    public function getEmailShare($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/card/' . $card->code;
        
        $subject = "Digital Business Card - " . $card->name;
        $body = "Hello,\n\nI'd like to share my digital business card with you.\n\nView my card: " . $shortLink . "\n\nBest regards,\n" . $card->name;
        
        $mailtoUrl = "mailto:?subject=" . urlencode($subject) . "&body=" . urlencode($body);
        
        return response()->json([
            'mailto_url' => $mailtoUrl,
            'subject' => $subject,
            'body' => $body,
            'short_link' => $shortLink
        ]);
    }

    // NEW: Bulk get sharing options
    public function getSharingOptions($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/card/' . $card->code;
        
        // WhatsApp
        $whatsappMessage = "👋 Hi! Check out my digital business card: " . $shortLink;
        $whatsappUrl = "https://api.whatsapp.com/send/?text=" . urlencode($whatsappMessage);
        
        // Email
        $emailSubject = "Digital Business Card - " . $card->name;
        $emailBody = "Hello,\n\nI'd like to share my digital business card with you.\n\nView my card: " . $shortLink . "\n\nBest regards,\n" . $card->name;
        $mailtoUrl = "mailto:?subject=" . urlencode($emailSubject) . "&body=" . urlencode($emailBody);
        
        // SMS
        $smsMessage = "Check out my digital business card: " . $shortLink;
        $smsUrl = "sms:?body=" . urlencode($smsMessage);
        
        return response()->json([
            'short_link' => $shortLink,
            'whatsapp' => [
                'url' => $whatsappUrl,
                'message' => $whatsappMessage
            ],
            'email' => [
                'url' => $mailtoUrl,
                'subject' => $emailSubject,
                'body' => $emailBody
            ],
            'sms' => [
                'url' => $smsUrl,
                'message' => $smsMessage
            ],
            'social' => [
                'twitter' => "https://twitter.com/intent/tweet?text=" . urlencode("Check out my digital business card: " . $shortLink),
                'linkedin' => "https://www.linkedin.com/sharing/share-offsite/?url=" . urlencode($shortLink),
                'facebook' => "https://www.facebook.com/sharer/sharer.php?u=" . urlencode($shortLink)
            ]
        ]);
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