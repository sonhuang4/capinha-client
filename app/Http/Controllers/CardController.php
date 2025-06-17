<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CardRequest;
use App\Models\ActivationCode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class CardController extends Controller
{
    // ========================================
    // EXISTING METHODS (UNCHANGED)
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
        try {
            $filter = request()->get('filter', 'all');

            // Get cards with basic stats
            $cards = \App\Models\Card::with('activations')->get();
            $totalCards = $cards->count();
            $activeCards = $cards->where('status', 'activated')->count();
            $totalClicks = $cards->sum('click_count');
            $avgClicks = $totalCards > 0 ? round($totalClicks / $totalCards, 1) : 0;

            // Build activation query based on filter
            $activationQuery = \App\Models\Activation::query();

            switch ($filter) {
                case 'today':
                    $activationQuery->today();
                    break;
                case '7days':
                    $activationQuery->where('created_at', '>=', now()->subDays(7));
                    break;
                case 'month':
                    $activationQuery->thisMonth();
                    break;
                case 'all':
                default:
                    // No filter, get all
                    break;
            }

            $totalActivations = $activationQuery->count();

            // Clicks by card name (for bar chart)
            $clicksByName = $cards->map(function($card) {
                return [
                    'name' => strlen($card->name) > 15 ? substr($card->name, 0, 15) . '...' : $card->name,
                    'clicks' => $card->click_count ?? 0
                ];
            })->sortByDesc('clicks')->take(10)->values()->toArray();

            // Status distribution (for pie chart)
            $statusCounts = [
                'activated' => $activeCards,
                'pending' => $totalCards - $activeCards
            ];

            // Activations by card (for bar chart)
            $activationsByCard = $activationQuery
                ->selectRaw('card_id, COUNT(*) as count')
                ->groupBy('card_id')
                ->with('card:id,name')
                ->get()
                ->map(function ($row) {
                    $name = $row->card->name ?? 'Cartão Deletado';
                    return [
                        'name' => strlen($name) > 15 ? substr($name, 0, 15) . '...' : $name,
                        'activations' => $row->count
                    ];
                })
                ->sortByDesc('activations')
                ->take(10)
                ->values()
                ->toArray();

            // Additional analytics
            $analytics = [
                // Basic stats
                'total_cards' => $totalCards,
                'active_cards' => $activeCards,
                'total_clicks' => $totalClicks,
                'avg_clicks' => $avgClicks,
                'total_activations' => $totalActivations,

                // Chart data
                'clicks_by_name' => $clicksByName,
                'status_counts' => $statusCounts,
                'activations_by_card' => $activationsByCard,

                // Time-based stats
                'activations_today' => \App\Models\Activation::today()->count(),
                'activations_this_week' => \App\Models\Activation::thisWeek()->count(),
                'activations_this_month' => \App\Models\Activation::thisMonth()->count(),

                // Device stats (if available)
                'device_stats' => $this->getDeviceStats($filter),
                
                // Recent activity
                'recent_cards' => $cards->sortByDesc('created_at')->take(5)->map(function($card) {
                    return [
                        'id' => $card->id,
                        'name' => $card->name,
                        'created_at' => $card->created_at->diffForHumans(),
                        'status' => $card->status,
                        'clicks' => $card->click_count ?? 0
                    ];
                })->values()->toArray(),

                // Growth stats
                'growth_stats' => $this->getGrowthStats()
            ];

            return response()->json($analytics);

        } catch (\Exception $e) {
            \Log::error('Analytics error: ' . $e->getMessage());
            
            // Return default/fallback data
            return response()->json([
                'total_cards' => 0,
                'active_cards' => 0,
                'total_clicks' => 0,
                'avg_clicks' => 0,
                'total_activations' => 0,
                'clicks_by_name' => [],
                'status_counts' => ['activated' => 0, 'pending' => 0],
                'activations_by_card' => [],
                'activations_today' => 0,
                'activations_this_week' => 0,
                'activations_this_month' => 0,
                'device_stats' => [],
                'recent_cards' => [],
                'growth_stats' => []
            ]);
        }
    }

    /**
     * Get device statistics
     */
    private function getDeviceStats($filter)
    {
        try {
            $query = \App\Models\Activation::query();
            
            switch ($filter) {
                case 'today':
                    $query->today();
                    break;
                case '7days':
                    $query->where('created_at', '>=', now()->subDays(7));
                    break;
                case 'month':
                    $query->thisMonth();
                    break;
            }

            return $query->selectRaw('
                    CASE 
                        WHEN LOWER(user_agent) LIKE "%mobile%" OR LOWER(user_agent) LIKE "%android%" THEN "Mobile"
                        WHEN LOWER(user_agent) LIKE "%tablet%" OR LOWER(user_agent) LIKE "%ipad%" THEN "Tablet"
                        ELSE "Desktop"
                    END as device_type,
                    COUNT(*) as count
                ')
                ->groupBy('device_type')
                ->get()
                ->map(function($item) {
                    return [
                        'name' => $item->device_type,
                        'value' => $item->count
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get growth statistics
     */
    private function getGrowthStats()
    {
        try {
            $thisMonth = \App\Models\Card::whereMonth('created_at', now()->month)
                                    ->whereYear('created_at', now()->year)
                                    ->count();
            
            $lastMonth = \App\Models\Card::whereMonth('created_at', now()->subMonth()->month)
                                    ->whereYear('created_at', now()->subMonth()->year)
                                    ->count();

            $growth = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1) : 0;

            return [
                'cards_this_month' => $thisMonth,
                'cards_last_month' => $lastMonth,
                'growth_percentage' => $growth
            ];
        } catch (\Exception $e) {
            return [
                'cards_this_month' => 0,
                'cards_last_month' => 0,
                'growth_percentage' => 0
            ];
        }
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
        $activationCode = session('activation_code'); // Get from session

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

        // Handle purchase flow
        $customerData = session('customer_data');
        if ($customerData) {
            $prefill = array_merge($prefill ?? [], $customerData);
        }

        return Inertia::render('RequestCardForm', [
            'activation_code' => $activationCode,
            'prefill' => $prefill
        ]);
    }

    // ========================================
    // UPDATED: CLIENT CARD CREATION WITH MINIMAL VALIDATION
    // ========================================

    /**
     * Handle client card creation with MINIMAL validation - only most important fields
     */
    public function storeClient(Request $request)
    {
        // MINIMAL VALIDATION - Only validate the most important fields
        $validated = $request->validate([
            // STEP 1: Most important - NAME (required)
            'name' => 'required|string|max:255',
            
            // STEP 2: Contact validation - at least one contact method (validated in frontend)
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            
            // STEP 3: Most important - COLOR_THEME (required)
            'color_theme' => 'required|in:blue,green,purple,pink,orange,dark',
            
            // STEP 4: Activation code (only if from purchase flow)
            'activation_code' => 'nullable|string|max:50',
            
            // OPTIONAL FIELDS - No validation, just accept them
            'job_title' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'instagram' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'twitter' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|string|max:500',
            'logo' => 'nullable|string|max:500',
            'request_id' => 'nullable|integer',
        ]);

        try {
            // STEP 2: Manual validation - at least one contact method
            if (empty($validated['email']) && empty($validated['phone']) && empty($validated['whatsapp'])) {
                return back()->withErrors([
                    'contact' => 'Pelo menos um meio de contato é obrigatório (email, telefone ou WhatsApp).'
                ]);
            }

            // Verify activation code if provided
            if (!empty($validated['activation_code'])) {
                $activationCode = ActivationCode::where('code', $validated['activation_code'])
                    ->where('status', 'sold')
                    ->first();

                if (!$activationCode) {
                    return back()->withErrors([
                        'activation_code' => 'Código de ativação inválido ou já utilizado.'
                    ]);
                }
            }

            // Generate required fields
            $cardCode = $this->generateUniqueCardCode();
            $uniqueSlug = $this->generateUniqueSlug();

            // Create card with ONLY CORE FIELDS that exist in database
            $cardData = [
                'user_id' => auth()->id(), // FIX: ADD THIS LINE - VERY IMPORTANT!
                'code' => $cardCode,
                'name' => $validated['name'],
                'color_theme' => $validated['color_theme'],
                'status' => 'activated',
                'click_count' => 0,
            ];

            // Add OPTIONAL fields only if they have values and exist in database
            $optionalFields = [
                'email', 'phone', 'whatsapp', 'website', 'instagram', 
                'profile_picture', 'logo', 'job_title', 'company', 
                'location', 'bio', 'linkedin', 'twitter', 'facebook',
                'activation_code', 'request_id'
            ];

            foreach ($optionalFields as $field) {
                if (!empty($validated[$field])) {
                    // Check if column exists in database before adding
                    if (Schema::hasColumn('cards', $field)) {
                        $cardData[$field] = $validated[$field];
                    }
                }
            }

            // Add unique_slug if your table has this field
            if (Schema::hasColumn('cards', 'unique_slug')) {
                $cardData['unique_slug'] = $uniqueSlug;
            }

            // Debug: Log what we're about to create
            \Log::info('Creating card with data:', [
                'user_id' => auth()->id(),
                'user_name' => auth()->user()->name ?? 'Unknown',
                'card_data_keys' => array_keys($cardData),
                'has_user_id' => isset($cardData['user_id']),
                'user_id_value' => $cardData['user_id'] ?? 'NOT SET'
            ]);

            // Create the card
            $card = Card::create($cardData);

            // Verify the card was created with user_id
            if (!$card->user_id) {
                \Log::error('Card created but user_id is null!', [
                    'card_id' => $card->id,
                    'auth_id' => auth()->id(),
                    'auth_check' => auth()->check()
                ]);
            }

            // Handle activation code if provided
            if (!empty($validated['activation_code']) && isset($activationCode)) {
                $activationCode->update([
                    'status' => 'activated',
                    'activated_at' => now()
                ]);
            }

            Log::info('Card created successfully', [
                'card_id' => $card->id,
                'card_code' => $card->code,
                'customer_name' => $card->name,
                'user_id' => $card->user_id, // Log this to verify
                'created_by' => auth()->user()->name ?? 'Unknown'
            ]);

            // Redirect to success or dashboard
            if (Schema::hasColumn('cards', 'unique_slug') && !empty($card->unique_slug)) {
                return redirect()->route('card.success', $card->unique_slug);
            } else {
                return redirect()->route('client.dashboard')->with('success', 'Cartão criado com sucesso!');
            }

        } catch (\Illuminate\Database\QueryException $e) {
            // Database error - log the specific issue
            Log::error('Database error during card creation', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql() ?? 'No SQL available',
                'bindings' => $e->getBindings() ?? [],
                'input_data' => $request->except(['activation_code']),
                'auth_user_id' => auth()->id()
            ]);

            return back()->withErrors([
                'general' => 'Erro na base de dados. Campo obrigatório pode estar em falta: ' . $e->getMessage()
            ]);

        } catch (\Exception $e) {
            // General error
            Log::error('Card creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input_data' => $request->except(['activation_code']),
                'auth_user_id' => auth()->id()
            ]);

            return back()->withErrors([
                'general' => 'Erro ao criar cartão: ' . $e->getMessage()
            ]);
        }
    }

    // Add these helper methods if they don't exist:

    private function generateUniqueCardCode()
    {
        do {
            $code = strtoupper(\Str::random(6));
        } while (Card::where('code', $code)->exists());
        
        return $code;
    }

    private function generateUniqueSlug()
    {
        do {
            $slug = \Str::random(10);
        } while (Card::where('unique_slug', $slug)->exists());
        
        return $slug;
    }
    public function success($slug)
    {
        $card = Card::where('unique_slug', $slug)->firstOrFail();
        
        return Inertia::render('CardSuccess', [
            'card' => $card,
            'card_url' => route('card.public', $card->code), // Use code, not slug
            'short_url' => config('app.url') . '/c/' . $card->code
        ]);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'type' => 'required|in:profile,logo'
        ]);

        try {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('public/images', $filename);
            
            return response()->json([
                'success' => true,
                'url' => Storage::url($path)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed'
            ], 500);
        }
    }
    /**
     * Public view using unique slug
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
    

    public function destroy($id)
    {
        try {
            $card = Card::findOrFail($id);
            
            // Optional: Add authorization check
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // Store card info for logging
            $cardInfo = [
                'id' => $card->id,
                'name' => $card->name,
                'code' => $card->code,
                'email' => $card->email
            ];
            
            // Delete the card (this will also delete related activations due to foreign key constraints)
            $card->delete();
            
            // Log the deletion
            \Log::info('Card deleted by admin', [
                'admin_id' => auth()->id(),
                'admin_email' => auth()->user()->email,
                'deleted_card' => $cardInfo
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Cartão deletado com sucesso'
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cartão não encontrado'
            ], 404);
            
        } catch (\Exception $e) {
            \Log::error('Failed to delete card: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }

    // ========================================
    // ENHANCED ORDER MANAGEMENT METHODS
    // ========================================

    /**
     * Enhanced admin dashboard with order management
     */
    public function adminDashboard()
    {
        $stats = $this->getAdminStats();
        $recentOrders = $this->getRecentOrders();
        $alerts = $this->getAdminAlerts();

        return Inertia::render('AdminDashboard', [
            'stats' => $stats,
            'recent_orders' => $recentOrders,
            'alerts' => $alerts
        ]);
    }

    /**
     * Get comprehensive admin statistics
     */
    private function getAdminStats()
    {
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Order statistics
        $ordersToday = Card::whereDate('created_at', $today)->count();
        $ordersWeek = Card::whereBetween('created_at', [$startOfWeek, Carbon::now()])->count();
        $ordersMonth = Card::whereBetween('created_at', [$startOfMonth, Carbon::now()])->count();
        $ordersTotal = Card::count();

        // Status breakdown
        $pending = Card::where('payment_status', 'pending')->count();
        $paid = Card::where('payment_status', 'paid')->count();
        $activated = Card::where('status', 'activated')->count();
        $expired = Card::whereNotNull('expiry_date')
                       ->where('expiry_date', '<', now())
                       ->count();

        // Revenue calculations
        $pricing = ['basic' => 49.90, 'premium' => 89.90, 'pro' => 149.90];
        $revenueToday = $ordersToday * $pricing['premium'];
        $revenueMonth = $ordersMonth * $pricing['premium'];

        // Conversion rate
        $conversionRate = $ordersTotal > 0 ? round(($activated / $ordersTotal) * 100, 1) : 0;

        return [
            'orders' => [
                'today' => $ordersToday,
                'week' => $ordersWeek,
                'month' => $ordersMonth,
                'total' => $ordersTotal,
            ],
            'status' => [
                'pending' => $pending,
                'paid' => $paid,
                'activated' => $activated,
                'expired' => $expired,
            ],
            'revenue' => [
                'today' => $revenueToday,
                'month' => $revenueMonth,
                'average_order' => $ordersTotal > 0 ? round($revenueMonth / ($ordersMonth ?: 1), 2) : 0,
            ],
            'performance' => [
                'conversion_rate' => $conversionRate,
                'total_clicks' => Card::sum('click_count'),
                'avg_clicks_per_card' => $activated > 0 ? round(Card::sum('click_count') / $activated, 1) : 0,
            ]
        ];
    }

    /**
     * Get recent orders for admin dashboard
     */
    private function getRecentOrders($limit = 10)
    {
        return Card::with(['cardRequest'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($card) {
                return [
                    'id' => $card->id,
                    'order_id' => '#ORD-' . str_pad($card->id, 6, '0', STR_PAD_LEFT),
                    'customer_name' => $card->name,
                    'customer_email' => $card->email,
                    'card_type' => $this->determineCardType($card),
                    'amount' => 'R$ ' . number_format($this->getCardRevenue($card), 2, ',', '.'),
                    'payment_status' => $card->payment_status ?: 'pending',
                    'order_status' => $this->getOrderStatus($card),
                    'created_at' => $card->created_at->toISOString(),
                    'time_ago' => $card->created_at->diffForHumans(),
                    'activation_code' => $card->activation_code,
                    'card_url' => config('app.frontend_url', 'http://localhost:8000') . '/c/' . $card->code,
                    'is_from_request' => !empty($card->request_id),
                ];
            });
    }

    /**
     * Get admin alerts
     */
    private function getAdminAlerts()
    {
        $pendingActivations = Card::where('payment_status', 'paid')
            ->where('status', 'pending')
            ->count();

        $expiringCards = Card::whereNotNull('expiry_date')
            ->where('expiry_date', '<=', now()->addDays(3))
            ->where('expiry_date', '>', now())
            ->count();

        $failedPayments = Card::where('payment_status', 'failed')->count();

        return [
            'pending_activations' => $pendingActivations,
            'expiring_cards' => $expiringCards,
            'failed_payments' => $failedPayments,
            'total_alerts' => $pendingActivations + $expiringCards + $failedPayments,
        ];
    }

    /**
     * Bulk activate cards (for admin)
     */
    public function bulkActivate(Request $request)
    {
        $validated = $request->validate([
            'card_ids' => 'required|array',
            'card_ids.*' => 'exists:cards,id'
        ]);

        $cards = Card::whereIn('id', $validated['card_ids'])->get();
        $successCount = 0;

        foreach ($cards as $card) {
            if ($card->status !== 'activated') {
                $card->update([
                    'status' => 'activated',
                    'activation_date' => now(),
                ]);
                $successCount++;

                // Send activation email
                if ($card->email) {
                    try {
                        $this->sendActivationEmail($card);
                    } catch (\Exception $e) {
                        Log::error('Failed to send bulk activation email: ' . $e->getMessage());
                    }
                }
            }
        }

        return redirect()->back()->with('success', 
            "{$successCount} cartões ativados com sucesso!"
        );
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'payment_method' => 'nullable|string',
        ]);

        $card = Card::findOrFail($id);
        
        $updateData = ['payment_status' => $validated['payment_status']];
        
        if ($validated['payment_method']) {
            $updateData['payment_method'] = $validated['payment_method'];
        }
        
        if ($validated['payment_status'] === 'paid') {
            $updateData['purchase_date'] = now();
        }
        
        $card->update($updateData);

        // Auto-activate if paid
        if ($validated['payment_status'] === 'paid' && $card->status === 'pending') {
            $card->update([
                'status' => 'activated',
                'activation_date' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Status de pagamento atualizado!');
    }

    /**
     * Send activation email
     */
    private function sendActivationEmail($card)
    {
        $subject = "Seu Cartão Digital está Pronto! - " . $card->name;
        $body = "Olá " . $card->name . ",\n\n";
        $body .= "Seu cartão digital foi ativado com sucesso!\n\n";
        $body .= "🔗 Link do seu cartão: " . config('app.frontend_url', 'http://localhost:8000') . '/c/' . $card->code . "\n\n";
        $body .= "Você pode compartilhar este link com qualquer pessoa.\n\n";
        $body .= "Atenciosamente,\nEquipe Capinha Digital";

        \Illuminate\Support\Facades\Mail::raw($body, function ($message) use ($card, $subject) {
            $message->to($card->email, $card->name)
                    ->subject($subject);
        });
    }

    /**
     * Determine card type based on features
     */
    private function determineCardType($card)
    {
        if ($card->logo && $card->linkedin && $card->company) {
            return 'pro';
        } elseif ($card->company || $card->job_title) {
            return 'premium';
        }
        
        return 'basic';
    }

    /**
     * Get card revenue based on type
     */
    private function getCardRevenue($card)
    {
        $pricing = [
            'basic' => 49.90,
            'premium' => 89.90,
            'pro' => 149.90
        ];
        
        $cardType = $this->determineCardType($card);
        
        return $pricing[$cardType] ?? 0;
    }

    /**
     * Get order status based on card state
     */
    private function getOrderStatus($card)
    {
        if (!empty($card->expiry_date) && Carbon::parse($card->expiry_date)->isPast()) {
            return 'expired';
        }
        
        if ($card->status === 'activated' && !empty($card->activation_date)) {
            return 'activated';
        }
        
        if ($card->payment_status === 'paid') {
            return 'paid';
        }
        
        if ($card->payment_status === 'pending') {
            return 'pending';
        }
        
        return 'pending';
    }

    /**
     * Enhanced index method with order management
     */
    public function indexWithOrders()
    {
        return Card::with(['cardRequest'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($card) {
                return [
                    'id' => $card->id,
                    'order_id' => '#ORD-' . str_pad($card->id, 6, '0', STR_PAD_LEFT),
                    'name' => $card->name,
                    'email' => $card->email,
                    'status' => $card->status,
                    'payment_status' => $card->payment_status ?: 'pending',
                    'order_status' => $this->getOrderStatus($card),
                    'click_count' => $card->click_count,
                    'created_at' => $card->created_at->format('d/m/Y H:i'),
                    'time_ago' => $card->created_at->diffForHumans(),
                    'card_url' => config('app.frontend_url', 'http://localhost:8000') . '/c/' . $card->code,
                    'revenue' => $this->getCardRevenue($card),
                    'card_type' => $this->determineCardType($card),
                    'is_from_request' => !empty($card->request_id),
                    'customer_notes' => $card->customer_notes,
                    'purchase_date' => $card->purchase_date ? Carbon::parse($card->purchase_date)->format('d/m/Y H:i') : null,
                    'activation_date' => $card->activation_date ? Carbon::parse($card->activation_date)->format('d/m/Y H:i') : null,
                    'expiry_date' => $card->expiry_date ? Carbon::parse($card->expiry_date)->format('d/m/Y H:i') : null,
                ];
            });
    }

    /**
     * Bulk operations for orders
     */
    public function bulkOrderAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:activate,email,export,delete,update_payment',
            'card_ids' => 'required|array',
            'card_ids.*' => 'exists:cards,id',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'payment_method' => 'nullable|string',
        ]);

        $cards = Card::whereIn('id', $validated['card_ids'])->get();

        switch ($validated['action']) {
            case 'activate':
                return $this->bulkActivateCards($cards);
            
            case 'email':
                return $this->bulkEmailCards($cards);
            
            case 'export':
                return $this->bulkExportCards($cards);
            
            case 'delete':
                return $this->bulkDeleteCards($cards);
            
            case 'update_payment':
                return $this->bulkUpdatePayment($cards, $validated);
        }
    }

    /**
     * Bulk activate cards
     */
    private function bulkActivateCards($cards)
    {
        $successCount = 0;
        $errors = [];

        foreach ($cards as $card) {
            try {
                if ($card->status !== 'activated') {
                    $card->update([
                        'status' => 'activated',
                        'activation_date' => now(),
                        'payment_status' => 'paid',
                    ]);
                    $successCount++;

                    // Send activation email
                    if ($card->email) {
                        $this->sendActivationEmail($card);
                    }
                }
            } catch (\Exception $e) {
                $errors[] = "Erro ao ativar cartão #{$card->id}: " . $e->getMessage();
            }
        }

        $message = "{$successCount} cartões ativados com sucesso.";
        if (!empty($errors)) {
            $message .= " Erros: " . implode(', ', $errors);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Bulk email cards
     */
    private function bulkEmailCards($cards)
    {
        $successCount = 0;
        $errors = [];

        foreach ($cards as $card) {
            if ($card->email) {
                try {
                    $this->sendActivationEmail($card);
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = "Erro ao enviar email para {$card->email}: " . $e->getMessage();
                }
            }
        }

        $message = "{$successCount} emails enviados com sucesso.";
        if (!empty($errors)) {
            $message .= " Erros: " . implode(', ', $errors);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Bulk export cards
     */
    private function bulkExportCards($cards)
    {
        $filename = 'cards_export_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($cards) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'ID', 'Order ID', 'Nome', 'Email', 'Telefone', 'WhatsApp', 'Empresa', 
                'Cargo', 'Status', 'Status Pagamento', 'Tipo Cartão', 'Receita',
                'Data Criação', 'Data Ativação', 'Clicks'
            ]);

            foreach ($cards as $card) {
                fputcsv($file, [
                    $card->id,
                    '#ORD-' . str_pad($card->id, 6, '0', STR_PAD_LEFT),
                    $card->name,
                    $card->email,
                    $card->phone,
                    $card->whatsapp,
                    $card->company,
                    $card->job_title,
                    $card->status,
                    $card->payment_status ?: 'pending',
                    $this->determineCardType($card),
                    'R$ ' . number_format($this->getCardRevenue($card), 2, ',', '.'),
                    $card->created_at->format('d/m/Y H:i'),
                    $card->activation_date ? Carbon::parse($card->activation_date)->format('d/m/Y H:i') : '',
                    $card->click_count ?? 0,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Bulk delete cards
     */
    private function bulkDeleteCards($cards)
    {
        $deleteCount = 0;
        $errors = [];

        foreach ($cards as $card) {
            try {
                $card->delete();
                $deleteCount++;
            } catch (\Exception $e) {
                $errors[] = "Erro ao deletar cartão #{$card->id}: " . $e->getMessage();
            }
        }

        $message = "{$deleteCount} cartões deletados com sucesso.";
        if (!empty($errors)) {
            $message .= " Erros: " . implode(', ', $errors);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Bulk update payment status
     */
    private function bulkUpdatePayment($cards, $validated)
    {
        $successCount = 0;
        $errors = [];

        foreach ($cards as $card) {
            try {
                $updateData = ['payment_status' => $validated['payment_status']];
                
                if (!empty($validated['payment_method'])) {
                    $updateData['payment_method'] = $validated['payment_method'];
                }
                
                if ($validated['payment_status'] === 'paid') {
                    $updateData['purchase_date'] = now();
                }
                
                $card->update($updateData);
                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Erro ao atualizar cartão #{$card->id}: " . $e->getMessage();
            }
        }

        $message = "{$successCount} cartões atualizados com sucesso.";
        if (!empty($errors)) {
            $message .= " Erros: " . implode(', ', $errors);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Set card expiry date
     */
    public function setExpiryDate(Request $request, $id)
    {
        $validated = $request->validate([
            'expiry_days' => 'required|integer|min:1|max:365',
        ]);

        $card = Card::findOrFail($id);
        $card->update([
            'expiry_date' => now()->addDays($validated['expiry_days'])
        ]);

        return redirect()->back()->with('success', 
            "Data de expiração definida para {$validated['expiry_days']} dias."
        );
    }

    /**
     * Extend card expiry
     */
    public function extendExpiry(Request $request, $id)
    {
        $validated = $request->validate([
            'extend_days' => 'required|integer|min:1|max:365',
        ]);

        $card = Card::findOrFail($id);
        
        $currentExpiry = $card->expiry_date ? Carbon::parse($card->expiry_date) : now();
        $newExpiry = $currentExpiry->addDays($validated['extend_days']);
        
        $card->update(['expiry_date' => $newExpiry]);

        return redirect()->back()->with('success', 
            "Expiração estendida por {$validated['extend_days']} dias."
        );
    }

    /**
     * Get order analytics
     */
    public function orderAnalytics()
    {
        try {
            $cards = Card::all();
            
            // Revenue by card type
            $revenueByType = $cards->groupBy(function($card) {
                return $this->determineCardType($card);
            })->map(function($group, $type) {
                return [
                    'type' => $type,
                    'count' => $group->count(),
                    'revenue' => $group->sum(function($card) {
                        return $this->getCardRevenue($card);
                    })
                ];
            })->values();

            // Monthly revenue trend
            $monthlyRevenue = $cards->groupBy(function($card) {
                return $card->created_at->format('Y-m');
            })->map(function($group, $month) {
                return [
                    'month' => $month,
                    'revenue' => $group->sum(function($card) {
                        return $this->getCardRevenue($card);
                    }),
                    'orders' => $group->count()
                ];
            })->values();

            return response()->json([
                'revenue_by_type' => $revenueByType,
                'monthly_revenue' => $monthlyRevenue,
                'total_revenue' => $cards->sum(function($card) {
                    return $this->getCardRevenue($card);
                }),
                'average_order_value' => $cards->count() > 0 ? 
                    $cards->sum(function($card) {
                        return $this->getCardRevenue($card);
                    }) / $cards->count() : 0,
            ]);

        } catch (\Exception $e) {
            Log::error('Order analytics error: ' . $e->getMessage());
            
            return response()->json([
                'revenue_by_type' => [],
                'monthly_revenue' => [],
                'total_revenue' => 0,
                'average_order_value' => 0,
            ]);
        }
    }
}