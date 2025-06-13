<?php
// app/Http/Controllers/CardController.php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CardRequest;

class CardController extends Controller
{
    public function index()
    {
        return Card::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'whatsapp' => 'nullable|string',
            'instagram' => 'nullable|string',
            'website' => 'nullable|string',
            'profile_picture' => 'nullable|string',
            'logo' => 'nullable|string',
            'color_theme' => 'nullable|string',
            'request_id' => 'nullable|integer', 
        ]);
        
        $data['code'] = \Str::random(6); 

        $card = Card::create($data);

        // If this card came from a request, mark it processed
        if (!empty($data['request_id'])) {
            \App\Models\CardRequest::where('id', $data['request_id'])->update([
                'status' => 'processed',
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Card created successfully.');
    }

    public function update(Request $request, $id)
    {
        $card = Card::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'profile_picture' => 'nullable|url',
            'logo' => 'nullable|url',
            'whatsapp' => 'nullable|string',
            'instagram' => 'nullable|string',
            'website' => 'nullable|string',
            'color_theme' => 'nullable|string',
            'status' => 'in:pending,activated',
        ]);

        if (!empty($validated['instagram']) && !str_starts_with($validated['instagram'], 'http')) {
            $validated['instagram'] = 'https://instagram.com/' . ltrim($validated['instagram'], '@/');
        }

        if (!empty($validated['website']) && !str_starts_with($validated['website'], 'http')) {
            $validated['website'] = 'https://' . ltrim($validated['website'], '/');
        }

        $card->update($validated);
        return response()->json($card);
    }

    public function showByCode($code)
    {
        $card = Card::where('code', $code)->firstOrFail();
        $card->increment('click_count');

        return Inertia::render('PublicCardView', [
            'card' => $card->only([
                'id', 'name', 'email', 'profile_picture', 'whatsapp', 'instagram', 'website'
            ])
        ]);
    }

    public function toggleStatus($id)
    {
        $card = Card::findOrFail($id);
        $card->status = ($card->status === 'activated') ? 'pending' : 'activated';
        $card->save();

        return response()->json($card);
    }

    // FIXED: Get short link for a card (corrected path)
    public function getShortLink($id)
    {
        $card = Card::findOrFail($id);
        
        // Generate short link URL - FIXED PATH
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;  // FIXED: /c/ instead of /card/
        
        return response()->json([
            'short_link' => $shortLink,
            'code' => $card->code,
            'card_name' => $card->name
        ]);
    }

    // FIXED: Get WhatsApp share link (corrected path and URL)
    public function getWhatsAppLink($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;  // FIXED: /c/ instead of /card/
        
        // WhatsApp message template
        $message = "👋 Hi! Check out my digital business card: " . $shortLink;
        $whatsappUrl = "https://api.whatsapp.com/send?text=" . urlencode($message);  // FIXED: Removed extra slash
        
        return response()->json([
            'whatsapp_url' => $whatsappUrl,
            'message' => $message,
            'short_link' => $shortLink
        ]);
    }

    // FIXED: Get email share content (corrected path and complete implementation)
    // public function getEmailShare($id)
    // {
    //     $card = Card::findOrFail($id);
        
    //     // Get base URL from config - FIXED PATH
    //     $baseUrl = config('app.frontend_url', 'http://localhost:8000');
    //     $shortLink = $baseUrl . '/c/' . $card->code;  // FIXED: /c/ instead of /card/
        
    //     // Use card owner's information
    //     $senderName = $card->name;
    //     $senderEmail = $card->email;
        
    //     // Create professional subject line
    //     $subject = "Digital Business Card - " . $card->name;
        
    //     // Create personalized email body
    //     $body = "Hi there!\n\n";
    //     $body .= "I hope this message finds you well.\n\n";
    //     $body .= "I'd like to share my digital business card with you for easy access to my contact information.\n\n";
    //     $body .= "📱 View my digital card: " . $shortLink . "\n\n";
    //     $body .= "You can save my contact details directly from the card.\n\n";
        
    //     // Add contact information if available
    //     if ($card->email) {
    //         $body .= "📧 Email: " . $card->email . "\n";
    //     }
    //     if ($card->whatsapp) {
    //         $body .= "📞 WhatsApp: " . $card->whatsapp . "\n";
    //     }
    //     if ($card->website) {
    //         $body .= "🌐 Website: " . $card->website . "\n";
    //     }
    //     if ($card->instagram) {
    //         $body .= "📱 Instagram: @" . $card->instagram . "\n";
    //     }
        
    //     $body .= "\nBest regards,\n" . $card->name;
        
    //     // Add professional signature if email exists
    //     if ($card->email) {
    //         $body .= "\n\n---\n";
    //         $body .= $card->name . "\n";
    //         $body .= $card->email;
    //         if ($card->website) {
    //             $body .= "\n" . $card->website;
    //         }
    //     }
        
    //     // Create mailto URL with proper encoding
    //     $mailtoUrl = "mailto:?subject=" . urlencode($subject) . "&body=" . urlencode($body);
        
    //     // Add CC to sender's email if available
    //     if ($senderEmail) {
    //         $mailtoUrl .= "&cc=" . urlencode($senderEmail);
    //     }
        
    //     return response()->json([
    //         'mailto_url' => $mailtoUrl,
    //         'subject' => $subject,
    //         'body' => $body,
    //         'short_link' => $shortLink,
    //         'sender_email' => $senderEmail,
    //         'sender_name' => $senderName,
    //         'has_sender_email' => !empty($senderEmail),
    //         'contact_info' => [
    //             'email' => $card->email,
    //             'whatsapp' => $card->whatsapp,
    //             'website' => $card->website,
    //             'instagram' => $card->instagram
    //         ]
    //     ]);
    // }

    public function getEmailShare($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;
        
        // SHORTER EMAIL BODY
        $subject = "Digital Business Card - " . $card->name;
        $body = "Hi!\n\nCheck out my digital business card: " . $shortLink . "\n\nBest regards,\n" . $card->name;
        
        $mailtoUrl = "mailto:?subject=" . urlencode($subject) . "&body=" . urlencode($body);
        
        return response()->json([
            'mailto_url' => $mailtoUrl,
            'subject' => $subject,
            'body' => $body,
            'short_link' => $shortLink
        ]);
    }

    // FIXED: Bulk get sharing options (corrected path)
    public function getSharingOptions($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;  // FIXED: /c/ instead of /card/
        
        // WhatsApp
        $whatsappMessage = "👋 Hi! Check out my digital business card: " . $shortLink;
        $whatsappUrl = "https://api.whatsapp.com/send?text=" . urlencode($whatsappMessage);  // FIXED: Removed extra slash
        
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

    public function sendEmailToUser($id)
        {
            try {
                \Log::info('Starting email send for card ID: ' . $id);
                
                $card = Card::findOrFail($id);
                \Log::info('Found card: ' . $card->name . ', Email: ' . $card->email);
                
                // Check if card has email
                if (!$card->email) {
                    \Log::warning('Card has no email address');
                    return response()->json([
                        'success' => false,
                        'message' => 'Card owner has no email address'
                    ], 400);
                }
                
                $baseUrl = config('app.frontend_url', 'http://localhost:8000');
                $shortLink = $baseUrl . '/c/' . $card->code;
                
                $subject = "Your Digital Business Card is Ready - " . $card->name;
                $body = "Hi " . $card->name . ",\n\n";
                $body .= "Your digital business card is now active!\n\n";
                $body .= "🔗 Your card link: " . $shortLink . "\n\n";
                $body .= "You can share this link with anyone to showcase your contact information.\n\n";
                $body .= "Best regards,\nCapinha Digital Team";
                
                \Log::info('About to send email to: ' . $card->email);
                
                // Send email using Laravel Mail
                \Illuminate\Support\Facades\Mail::raw($body, function ($message) use ($card, $subject) {
                    $message->to($card->email, $card->name)
                            ->subject($subject);
                });
                
                \Log::info('Email sent successfully');
                
                return response()->json([
                    'success' => true,
                    'message' => 'Email sent successfully to ' . $card->email,
                    'recipient' => $card->email,
                    'subject' => $subject
                ]);
                
            } catch (\Exception $e) {
                \Log::error('Email sending failed: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send email: ' . $e->getMessage()
                ], 500);
            }
        }

        public function storePublicRequest(Request $request)
        {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'whatsapp' => 'nullable|string|max:30',
                'instagram' => 'nullable|string|max:100',
                'website' => 'nullable|string|max:255',
                'profile_picture' => 'nullable|url',
                'logo' => 'nullable|url',
                'color_theme' => 'nullable|string|max:50',
            ]);

            CardRequest::create($validated);

            return redirect('/request/thanks'); // optional thank-you page
        }


        public function create(Request $request)
        {
            $prefill = null;

            if ($request->filled('request_id')) {
                $cardRequest = \App\Models\CardRequest::find($request->input('request_id'));

                if ($cardRequest) {
                    $prefill = [
                        'name' => $cardRequest->name,
                        'email' => $cardRequest->email,
                        'whatsapp' => $cardRequest->whatsapp,
                        'instagram' => $cardRequest->instagram,
                        'website' => $cardRequest->website,
                        'profile_picture' => $cardRequest->profile_picture,
                        'logo' => $cardRequest->logo,
                        'color_theme' => $cardRequest->color_theme,
                        'request_id' => $cardRequest->id,
                    ];
                }
            }

            return Inertia::render('CardForm', [
                'prefill' => $prefill
            ]);
        }
}