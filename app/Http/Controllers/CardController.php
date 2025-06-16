<?php
// app/Http/Controllers/CardController.php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CardRequest;
use App\Models\ActivationCode; // ADD THIS
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CardController extends Controller
{
    // ========================================
    // EXISTING METHODS (Keep all your current methods)
    // ========================================
    
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

    public function getShortLink($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;
        
        return response()->json([
            'short_link' => $shortLink,
            'code' => $card->code,
            'card_name' => $card->name
        ]);
    }

    public function getWhatsAppLink($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;
        
        $message = "👋 Hi! Check out my digital business card: " . $shortLink;
        $whatsappUrl = "https://api.whatsapp.com/send?text=" . urlencode($message);
        
        return response()->json([
            'whatsapp_url' => $whatsappUrl,
            'message' => $message,
            'short_link' => $shortLink
        ]);
    }

    public function getEmailShare($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;
        
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

    public function getSharingOptions($id)
    {
        $card = Card::findOrFail($id);
        
        $baseUrl = config('app.frontend_url', 'http://localhost:8000');
        $shortLink = $baseUrl . '/c/' . $card->code;
        
        $whatsappMessage = "👋 Hi! Check out my digital business card: " . $shortLink;
        $whatsappUrl = "https://api.whatsapp.com/send?text=" . urlencode($whatsappMessage);
        
        $emailSubject = "Digital Business Card - " . $card->name;
        $emailBody = "Hello,\n\nI'd like to share my digital business card with you.\n\nView my card: " . $shortLink . "\n\nBest regards,\n" . $card->name;
        $mailtoUrl = "mailto:?subject=" . urlencode($emailSubject) . "&body=" . urlencode($emailBody);
        
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
        $filter = request()->get('filter', 'all');

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

        $activationQuery = \App\Models\Activation::query();

        if ($filter === 'today') {
            $activationQuery->whereDate('created_at', today());
        } elseif ($filter === '7days') {
            $activationQuery->where('created_at', '>=', now()->subDays(7));
        } elseif ($filter === 'month') {
            $activationQuery->whereMonth('created_at', now()->month)
                            ->whereYear('created_at', now()->year);
        }

        $totalActivations = $activationQuery->count();

        $activationsByCard = $activationQuery->selectRaw('card_id, COUNT(*) as count')
            ->groupBy('card_id')
            ->with('card:id,name')
            ->get()
            ->map(function ($row) {
                return [
                    'name' => $row->card->name ?? 'Desconhecido',
                    'activations' => $row->count
                ];
            });

        return response()->json([
            'total_cards' => $totalCards,
            'active_cards' => $activeCards,
            'total_clicks' => $totalClicks,
            'avg_clicks' => $avgClicks,
            'clicks_by_name' => $clicksByName,
            'status_counts' => $statusCounts,
            'total_activations' => $totalActivations,
            'activations_by_card' => $activationsByCard,
        ]);
    }

    public function sendEmailToUser($id)
    {
        try {
            \Log::info('Starting email send for card ID: ' . $id);
            
            $card = Card::findOrFail($id);
            \Log::info('Found card: ' . $card->name . ', Email: ' . $card->email);
            
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

        return redirect('/request/thanks');
    }

    public function create(Request $request)
    {
        $prefill = null;
        $activationCode = session('activation_code'); // ADD THIS - Get from session

        // Handle existing request system
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

        // Handle purchase flow - ADD THIS
        $customerData = session('customer_data');
        if ($customerData) {
            $prefill = array_merge($prefill ?? [], $customerData);
        }

        return Inertia::render('RequestCardForm', [ // CHANGE FROM 'CardForm' to 'ClientCardCreator'
            'activation_code' => $activationCode,
            'prefill' => $prefill
        ]);
    }

    // ========================================
    // NEW METHODS FOR PURCHASE FLOW - ADD THESE
    // ========================================

    /**
     * Handle client card creation from purchase flow
     */
    public function storeClient(Request $request)
    {
        $validated = $request->validate([
            'activation_code' => 'required|string|exists:activation_codes,code',
            'name' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'instagram' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'twitter' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|url|max:500',
            'logo' => 'nullable|url|max:500',
            'color_theme' => 'required|in:blue,green,purple,pink,orange,dark',
        ]);

        try {
            // Verify activation code is valid and not used
            $activationCode = ActivationCode::where('code', $validated['activation_code'])
                ->where('status', 'sold')
                ->first();

            if (!$activationCode) {
                return back()->withErrors([
                    'activation_code' => 'Código de ativação inválido ou já utilizado.'
                ]);
            }

            // Generate unique slug for card (use existing code logic + unique slug)
            $uniqueSlug = $this->generateUniqueSlug();
            $cardCode = Str::random(6); // Keep your existing code system

            // Create the card with both systems
            $card = Card::create([
                'activation_code' => $validated['activation_code'],
                'unique_slug' => $uniqueSlug,
                'code' => $cardCode, // Keep existing code field
                'name' => $validated['name'],
                'job_title' => $validated['job_title'],
                'company' => $validated['company'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'whatsapp' => $validated['whatsapp'],
                'website' => $validated['website'],
                'location' => $validated['location'],
                'bio' => $validated['bio'],
                'instagram' => $validated['instagram'],
                'linkedin' => $validated['linkedin'],
                'twitter' => $validated['twitter'],
                'facebook' => $validated['facebook'],
                'profile_picture' => $validated['profile_picture'],
                'logo' => $validated['logo'],
                'color_theme' => $validated['color_theme'],
                'status' => 'activated',
                'click_count' => 0,
            ]);

            // Mark activation code as used
            $activationCode->update([
                'status' => 'activated',
                'activated_at' => now()
            ]);

            Log::info('Card created successfully', [
                'card_id' => $card->id,
                'activation_code' => $validated['activation_code'],
                'slug' => $uniqueSlug
            ]);

            // Redirect to success page
            return redirect()->route('card.success', $card->unique_slug);

        } catch (\Exception $e) {
            Log::error('Card creation failed', [
                'error' => $e->getMessage(),
                'activation_code' => $validated['activation_code']
            ]);

            return back()->withErrors([
                'general' => 'Erro ao criar cartão. Tente novamente.'
            ]);
        }
    }

    /**
     * Show success page after card creation
     */
    public function success($slug)
    {
        $card = Card::where('unique_slug', $slug)->firstOrFail();
        
        return Inertia::render('CardSuccess', [
            'card' => $card,
            'card_url' => route('card.public', $slug),
            'qr_url' => route('card.qr', $slug), // You'll need to create this route
            'short_url' => config('app.frontend_url', 'http://localhost:8000') . '/c/' . $card->code
        ]);
    }

    /**
     * Public view using unique slug (NEW)
     */
    public function publicView($slug)
    {
        $card = Card::where('unique_slug', $slug)->firstOrFail();
        
        // Increment click count
        $card->increment('click_count');

        return Inertia::render('PublicCardView', [
            'card' => $card->only([
                'id', 'name', 'job_title', 'company', 'email', 'phone', 'whatsapp', 
                'website', 'location', 'bio', 'instagram', 'linkedin', 'twitter', 
                'facebook', 'profile_picture', 'logo', 'color_theme'
            ])
        ]);
    }

    /**
     * Generate QR code for card
     */
    public function generateQR($slug)
    {
        $card = Card::where('unique_slug', $slug)->firstOrFail();
        
        $cardUrl = route('card.public', $slug);
        
        return Inertia::render('CardQR', [
            'card' => $card,
            'qr_url' => $cardUrl,
            'download_url' => route('card.qr.download', $slug)
        ]);
    }

    /**
     * Generate unique slug for new system
     */
    private function generateUniqueSlug(): string
    {
        do {
            $slug = strtoupper(Str::random(6));
        } while (Card::where('unique_slug', $slug)->exists());

        return $slug;
    }
}