<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ActivationCode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
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
        ]);
        
        $data['code'] = \Str::random(6); 

        $card = Card::create($data);

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
        $card = Card::where('code', $code)->first();
        
        if (!$card) {
            if (request()->expectsJson()) {
                return response()->json(['error' => 'Card not found'], 404);
            }
            abort(404);
        }
        
        // Check if card is activated
        if ($card->status !== 'activated') {
            if (request()->expectsJson()) {
                return response()->json(['status' => 'pending'], 200);
            }
            
            return Inertia::render('PublicCardView', [
                'code' => $code,
                'card' => null,
                'error' => 'Este cartão está pendente ou o link é inválido.'
            ]);
        }
        
        if (request()->expectsJson()) {
            return response()->json($card);
        }
        
        // Increment click count
        $card->increment('click_count');
        
        return Inertia::render('PublicCardView', [
            'code' => $code,
            'card' => [
                'id' => $card->id,
                'name' => $card->name,
                'job_title' => $card->job_title,
                'company' => $card->company,
                'email' => $card->email,
                'phone' => $card->phone,
                'whatsapp' => $card->whatsapp,
                'website' => $card->website,
                'location' => $card->location,
                'bio' => $card->bio,
                'instagram' => $card->instagram,
                'linkedin' => $card->linkedin,
                'twitter' => $card->twitter,
                'facebook' => $card->facebook,
                'profile_picture' => $card->profile_picture,
                'logo' => $card->logo,
                'color_theme' => $card->color_theme ?? 'blue',
            ]
        ]);
    }

    public function toggleStatus($id)
    {
        $card = Card::findOrFail($id);
        $card->status = ($card->status === 'activated') ? 'pending' : 'activated';
        $card->save();

        return response()->json($card);
    }

    // ========================================
    // FIXED SHARING METHODS
    // ========================================

    public function getShortLink($id)
    {
        try {
            $card = Card::findOrFail($id);
            
            $baseUrl = config('app.url', 'http://localhost:8000');
            $shortLink = $baseUrl . '/c/' . $card->code;
            
            return response()->json([
                'success' => true,
                'short_link' => $shortLink,
                'code' => $card->code,
                'card_name' => $card->name
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get short link: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate short link'
            ], 500);
        }
    }

    public function getWhatsAppShare($id)
    {
        try {
            $card = Card::findOrFail($id);
            
            $baseUrl = config('app.url', 'http://localhost:8000');
            $shortLink = $baseUrl . '/c/' . $card->code;
            
            $message = "👋 Olá! Confira meu cartão de visita digital: " . $shortLink;
            $whatsappUrl = "https://api.whatsapp.com/send?text=" . urlencode($message);
            
            return response()->json([
                'success' => true,
                'whatsapp_url' => $whatsappUrl,
                'fallback_message' => $message,
                'short_link' => $shortLink
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get WhatsApp share: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate WhatsApp link'
            ], 500);
        }
    }

    public function getEmailShare($id)
    {
        try {
            $card = Card::findOrFail($id);
            
            $baseUrl = config('app.url', 'http://localhost:8000');
            $shortLink = $baseUrl . '/c/' . $card->code;
            
            $subject = "Cartão Digital - " . $card->name;
            $body = "Olá!\n\nConfira meu cartão de visita digital: " . $shortLink . "\n\nAtenciosamente,\n" . $card->name;
            
            return response()->json([
                'success' => true,
                'subject' => $subject,
                'body' => $body,
                'short_link' => $shortLink
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get email share: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate email content'
            ], 500);
        }
    }

    public function getSharingOptions($id)
    {
        try {
            $card = Card::findOrFail($id);
            
            $baseUrl = config('app.url', 'http://localhost:8000');
            $shortLink = $baseUrl . '/c/' . $card->code;
            
            $whatsappMessage = "👋 Olá! Confira meu cartão de visita digital: " . $shortLink;
            $whatsappUrl = "https://api.whatsapp.com/send?text=" . urlencode($whatsappMessage);
            
            $emailSubject = "Cartão Digital - " . $card->name;
            $emailBody = "Olá,\n\nGostaria de compartilhar meu cartão de visita digital com você.\n\nVer meu cartão: " . $shortLink . "\n\nAtenciosamente,\n" . $card->name;
            $mailtoUrl = "mailto:?subject=" . urlencode($emailSubject) . "&body=" . urlencode($emailBody);
            
            $smsMessage = "Confira meu cartão de visita digital: " . $shortLink;
            $smsUrl = "sms:?body=" . urlencode($smsMessage);
            
            return response()->json([
                'success' => true,
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
                    'twitter' => "https://twitter.com/intent/tweet?text=" . urlencode("Confira meu cartão de visita digital: " . $shortLink),
                    'linkedin' => "https://www.linkedin.com/sharing/share-offsite/?url=" . urlencode($shortLink),
                    'facebook' => "https://www.facebook.com/sharer/sharer.php?u=" . urlencode($shortLink)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get sharing options: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sharing options'
            ], 500);
        }
    }

    public function sendEmailToUser($id)
    {
        try {
            Log::info('Starting email send for card ID: ' . $id);
            
            $card = Card::findOrFail($id);
            Log::info('Found card: ' . $card->name . ', Email: ' . $card->email);
            
            if (!$card->email) {
                Log::warning('Card has no email address');
                return response()->json([
                    'success' => false,
                    'message' => 'Card owner has no email address'
                ], 400);
            }
            
            $baseUrl = config('app.url', 'http://localhost:8000');
            $shortLink = $baseUrl . '/c/' . $card->code;
            
            $subject = "Seu Cartão Digital está Pronto - " . $card->name;
            $body = "Olá " . $card->name . ",\n\n";
            $body .= "Seu cartão de visita digital está ativo!\n\n";
            $body .= "🔗 Link do seu cartão: " . $shortLink . "\n\n";
            $body .= "Você pode compartilhar este link com qualquer pessoa para mostrar suas informações de contato.\n\n";
            $body .= "Atenciosamente,\nEquipe Capinha Digital";
            
            Log::info('About to send email to: ' . $card->email);
            
            \Illuminate\Support\Facades\Mail::raw($body, function ($message) use ($card, $subject) {
                $message->to($card->email, $card->name)
                        ->subject($subject);
            });
            
            Log::info('Email sent successfully');
            
            return response()->json([
                'success' => true,
                'message' => 'Email enviado com sucesso para ' . $card->email,
                'recipient' => $card->email,
                'subject' => $subject
            ]);
            
        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Falha ao enviar email: ' . $e->getMessage()
            ], 500);
        }
    }

    // ========================================
    // ANALYTICS METHODS
    // ========================================

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
                    $activationQuery->whereDate('created_at', today());
                    break;
                case '7days':
                    $activationQuery->where('created_at', '>=', now()->subDays(7));
                    break;
                case 'month':
                    $activationQuery->whereMonth('created_at', now()->month)
                                   ->whereYear('created_at', now()->year);
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
                'activations_today' => \App\Models\Activation::whereDate('created_at', today())->count(),
                'activations_this_week' => \App\Models\Activation::whereBetween('created_at', [now()->startOfWeek(), now()])->count(),
                'activations_this_month' => \App\Models\Activation::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),

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
                    $query->whereDate('created_at', today());
                    break;
                case '7days':
                    $query->where('created_at', '>=', now()->subDays(7));
                    break;
                case 'month':
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
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

    // ========================================
    // CARD CREATION AND MANAGEMENT
    // ========================================

    public function create(Request $request)
    {
        // Check if user has paid (NEW CHECK)
        $paidPayment = \App\Models\Payment::where('user_id', auth()->id())
                                         ->where('status', 'paid')
                                         ->whereNull('card_id')
                                         ->first();

        if (!$paidPayment) {
            return redirect()->route('purchase.index')
                            ->with('error', 'Você precisa comprar um plano antes de criar seu cartão.');
        }

        // Prepare prefill data
        $prefill = null;
        $activationCode = session('activation_code');

        // NEW: Add payment data to prefill
        if ($paidPayment) {
            $prefill = [
                'name' => $paidPayment->customer_name,
                'email' => $paidPayment->customer_email,
                'phone' => $paidPayment->customer_phone,
            ];
        }

        $customerData = session('customer_data');
        if ($customerData) {
            $prefill = array_merge($prefill ?? [], $customerData);
        }

        return Inertia::render('RequestCardForm', [
            'activation_code' => $activationCode,
            'prefill' => $prefill,
            'payment' => $paidPayment ? [  // NEW
                'id' => $paidPayment->id,
                'plan' => $paidPayment->plan,
                'plan_name' => $paidPayment->plan_name,
            ] : null,
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
        try {
            // ✅ STEP 1: CHECK PAYMENT
            $paidPayment = \App\Models\Payment::where('user_id', auth()->id())
                                            ->where('status', 'paid')
                                            ->whereNull('card_id')
                                            ->first();

            if (!$paidPayment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pagamento não encontrado',
                    'errors' => [
                        'general' => 'Você precisa comprar um plano antes de criar seu cartão.'
                    ]
                ], 422);
            }

            // ✅ STEP 2: VALIDATE REQUEST DATA
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'whatsapp' => 'nullable|string|max:20',
                'color_theme' => 'required|in:blue,green,purple,pink,orange,dark',
                'activation_code' => 'nullable|string|max:50',
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
            ]);

            // ✅ STEP 3: BUSINESS LOGIC VALIDATION
            if (empty($validated['email']) && empty($validated['phone']) && empty($validated['whatsapp'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meio de contato obrigatório',
                    'errors' => [
                        'contact' => 'Pelo menos um meio de contato é obrigatório (email, telefone ou WhatsApp).'
                    ]
                ], 422);
            }

            // ✅ STEP 4: HANDLE ACTIVATION CODE (OPTIONAL)
            $activationCode = null;
            $activationCodeValue = $validated['activation_code'] ?? session('activation_code');
            
            if ($activationCodeValue) {
                $activationCode = ActivationCode::where('code', $activationCodeValue)
                    ->where('status', 'sold')
                    ->first();

                if (!$activationCode) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Código de ativação inválido',
                        'errors' => [
                            'activation_code' => 'Código de ativação inválido ou já utilizado.'
                        ]
                    ], 422);
                }
            }

            // ✅ STEP 5: GENERATE UNIQUE IDENTIFIERS
            $cardCode = $this->generateUniqueCardCode();
            $uniqueSlug = $this->generateUniqueSlug();

            // ✅ STEP 6: PREPARE CARD DATA
            $cardData = [
                'user_id' => auth()->id(),
                'code' => $cardCode,
                'unique_slug' => $uniqueSlug,
                'name' => $validated['name'],
                'color_theme' => $validated['color_theme'],
                'status' => 'activated',
                'click_count' => 0,
                'plan' => $paidPayment->plan,
            ];

            // ✅ ADD PAYMENT TRACKING
            if (Schema::hasColumn('cards', 'payment_id')) {
                $cardData['payment_id'] = $paidPayment->id;
            }

            // ✅ ADD ACTIVATION CODE IF PROVIDED
            if ($activationCode) {
                $cardData['activation_code'] = $activationCode->code;
            }

            // ✅ ADD OPTIONAL FIELDS
            $optionalFields = [
                'email', 'phone', 'whatsapp', 'website', 'instagram', 
                'profile_picture', 'logo', 'job_title', 'company', 
                'location', 'bio', 'linkedin', 'twitter', 'facebook'
            ];

            foreach ($optionalFields as $field) {
                if (!empty($validated[$field])) {
                    if (Schema::hasColumn('cards', $field)) {
                        $cardData[$field] = $validated[$field];
                    }
                }
            }

            // ✅ STEP 7: CREATE CARD IN DATABASE
            Log::info('Creating card with payment integration', [
                'user_id' => auth()->id(),
                'user_name' => auth()->user()->name ?? 'Unknown',
                'payment_id' => $paidPayment->payment_id,
                'plan' => $paidPayment->plan,
                'card_data_keys' => array_keys($cardData),
            ]);

            $card = Card::create($cardData);

            if (!$card->user_id) {
                Log::error('Card created but user_id is null!', [
                    'card_id' => $card->id,
                    'auth_id' => auth()->id(),
                    'auth_check' => auth()->check()
                ]);
            }

            // ✅ STEP 8: LINK PAYMENT TO CARD
            $paidPayment->linkToCard($card);

            // ✅ STEP 9: UPDATE ACTIVATION CODE STATUS
            if (!empty($validated['activation_code']) && isset($activationCode)) {
                $activationCode->update([
                    'status' => 'activated',
                    'activated_at' => now()
                ]);
            }

            // ✅ STEP 10: LOG SUCCESS
            Log::info('Card created successfully', [
                'card_id' => $card->id,
                'card_code' => $card->code,
                'card_slug' => $card->unique_slug,
                'customer_name' => $card->name,
                'user_id' => $card->user_id,
                'payment_id' => $paidPayment->payment_id,
                'plan' => $paidPayment->plan,
                'created_by' => auth()->user()->name ?? 'Unknown'
            ]);

            // ✅ STEP 11: RETURN COMPLETE SUCCESS RESPONSE
            return response()->json([
                'success' => true,
                'message' => 'Cartão criado com sucesso!',
                'card' => [
                    // Essential card data
                    'id' => $card->id,
                    'unique_slug' => $card->unique_slug,
                    'code' => $card->code,
                    'name' => $card->name,
                    'email' => $card->email,
                    'phone' => $card->phone,
                    'whatsapp' => $card->whatsapp,
                    'company' => $card->company,
                    'job_title' => $card->job_title,
                    'color_theme' => $card->color_theme,
                    'status' => $card->status,
                    'plan' => $card->plan,
                    'user_id' => $card->user_id,
                    
                    // URLs for frontend use
                    'public_url' => route('card.public', $card->unique_slug),
                    'short_url' => config('app.url') . '/c/' . $card->code,
                    
                    // Timestamps
                    'created_at' => $card->created_at->toISOString(),
                ],
                'payment' => [
                    'id' => $paidPayment->id,
                    'plan' => $paidPayment->plan,
                    'plan_name' => $paidPayment->plan_name ?? 'Premium',
                    'amount' => $paidPayment->amount,
                    'formatted_amount' => 'R$ ' . number_format($paidPayment->amount / 100, 2, ',', '.'),
                ],
                'urls' => [
                    'redirect_url' => route('card.success', $card->unique_slug),
                    'dashboard_url' => route('client.dashboard'),
                    'edit_url' => route('client.cards.edit', $card->id),
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error during card creation', [
                'errors' => $e->errors(),
                'input_data' => $request->except(['activation_code']),
                'auth_user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error during card creation', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql() ?? 'No SQL available',
                'bindings' => $e->getBindings() ?? [],
                'input_data' => $request->except(['activation_code']),
                'auth_user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro na base de dados',
                'errors' => [
                    'general' => 'Erro na base de dados. Campo obrigatório pode estar em falta: ' . $e->getMessage()
                ]
            ], 422);

        } catch (\Exception $e) {
            Log::error('Card creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input_data' => $request->except(['activation_code']),
                'auth_user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor',
                'errors' => [
                    'general' => 'Erro ao criar cartão: ' . $e->getMessage()
                ]
            ], 500);
        }
    }

    // ✅ HELPER METHODS
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
        
        // Get payment info if exists
        $payment = \App\Models\Payment::where('card_id', $card->id)->first();
        
        // Generate QR code URL - THIS IS THE KEY ADDITION
        $qrCodeUrl = config('app.url') . '/c/' . $card->code;
        
        return Inertia::render('CardSuccess', [
            'card' => [
                'id' => $card->id,
                'name' => $card->name,
                'code' => $card->code,
                'email' => $card->email,
                'phone' => $card->phone,
                'whatsapp' => $card->whatsapp,
                'company' => $card->company,
                'job_title' => $card->job_title,
                'color_theme' => $card->color_theme,
                'plan' => $card->plan,
            ],
            'payment' => $payment ? [
                'plan_name' => $payment->plan_name,
                'formatted_amount' => $payment->formatted_amount,
                'paid_at' => $payment->paid_at->format('d/m/Y H:i'),
            ] : null,
            'card_url' => route('card.view.code', $card->code),
            'short_url' => config('app.url') . '/c/' . $card->code,
            'dashboard_url' => route('client.dashboard'),
            // ADD THESE QR CODE RELATED DATA:
            'qr_code_url' => $qrCodeUrl, // The URL that goes in the QR code
            'qr_download_url' => route('card.qr.download', $card->unique_slug), // For downloading QR
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

        return Inertia::render('dashboard', [
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
        return Card::select(['id', 'name', 'email', 'status', 'payment_status', 'created_at', 'activation_code', 'code', 'company', 'job_title', 'logo', 'linkedin'])
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
                    'card_url' => config('app.url', 'http://localhost:8000') . '/c/' . $card->code,
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
        $body .= "🔗 Link do seu cartão: " . config('app.url', 'http://localhost:8000') . '/c/' . $card->code . "\n\n";
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
        return Card::select(['id', 'name', 'email', 'status', 'payment_status', 'created_at', 'code', 'click_count', 'customer_notes', 'purchase_date', 'activation_date', 'expiry_date', 'company', 'job_title', 'logo', 'linkedin'])
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
                    'card_url' => config('app.url', 'http://localhost:8000') . '/c/' . $card->code,
                    'revenue' => $this->getCardRevenue($card),
                    'card_type' => $this->determineCardType($card),
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

    public function showActivations(Card $card)
    {
        // Load the card with its activations
        $card->load(['activations' => function($query) {
            $query->orderBy('created_at', 'desc');
        }]);

        return Inertia::render('Admin/Users/CardActivations', [
            'card' => [
                'id' => $card->id,
                'name' => $card->name,
                'activations' => $card->activations->map(function($activation) {
                    return [
                        'id' => $activation->id,
                        'ip_address' => $activation->ip_address,
                        'user_agent' => $activation->user_agent,
                        'created_at' => $activation->created_at->format('Y-m-d H:i:s'),
                        'location' => $activation->location,
                    ];
                })
            ]
        ]);
    }

    public function exportActivations(Card $card)
    {
        $activations = $card->activations()->orderBy('created_at', 'desc')->get();
        
        $csvData = [];
        $csvData[] = ['Data', 'IP', 'User Agent', 'Location']; // Header
        
        foreach ($activations as $activation) {
            $csvData[] = [
                $activation->created_at->format('Y-m-d H:i:s'),
                $activation->ip_address,
                $activation->user_agent,
                $activation->location ?? 'N/A'
            ];
        }
        
        $filename = "activations_{$card->name}_{now()->format('Y-m-d')}.csv";
        
        return response()->streamDownload(function() use ($csvData) {
            $handle = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($handle, $row);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
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
            \Log::error('Order analytics error: ' . $e->getMessage());
            
            return response()->json([
                'revenue_by_type' => [],
                'monthly_revenue' => [],
                'total_revenue' => 0,
                'average_order_value' => 0,
            ]);
        }
    }
}