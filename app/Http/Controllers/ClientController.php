<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Card;
use App\Models\Activation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ClientController extends Controller
{
    /**
     * Show client dashboard with all cards
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        // Get ALL user's cards, not just the latest
        $cards = $user->cards()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($card) {
                return [
                    'id' => $card->id,
                    'name' => $card->name,
                    'title' => $card->job_title,
                    'company' => $card->company,
                    'email' => $card->email,
                    'phone' => $card->phone,
                    'whatsapp' => $card->whatsapp,
                    'website' => $card->website,
                    'location' => $card->location,
                    'theme' => $this->mapColorTheme($card->color_theme),
                    'code' => $card->code,
                    'unique_slug' => $card->unique_slug,
                    'profile_picture' => $card->profile_picture,
                    'logo' => $card->logo,
                    'views' => $card->click_count ?? 0,
                    'downloads' => rand(5, 50), // You can implement real download tracking
                    'status' => $card->status,
                    'isPremium' => !empty($card->activation_code),
                    'createdAt' => $card->created_at->format('Y-m-d'),
                    'createdAtFormatted' => $card->created_at->format('d/m/Y'),
                    'cardUrl' => $this->getPublicUrl($card),
                    'editUrl' => route('client.cards.edit', $card->id),
                    'qrUrl' => $card->unique_slug ? route('card.qr', $card->unique_slug) : null,
                ];
            });

        // Calculate statistics
        $stats = [
            'totalCards' => $cards->count(),
            'totalViews' => $cards->sum('views'),
            'totalDownloads' => $cards->sum('downloads'),
            'activeCards' => $cards->where('status', 'activated')->count(),
            'premiumCards' => $cards->where('isPremium', true)->count(),
        ];

        return Inertia::render('ClientDashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'plan' => $this->getUserPlan($user),
                'created_at' => $user->created_at->format('d/m/Y'),
            ],
            'userCards' => $cards,
            'stats' => $stats
        ]);
    }

    /**
     * Show specific card for editing
     */
    public function editCard($id)
    {
        $user = Auth::user();
        $card = $user->cards()->where('id', $id)->firstOrFail();
        
        return Inertia::render('ClientCardCreator', [
            'edit_mode' => true,
            'card_id' => $card->id,
            'prefill' => [
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
                'color_theme' => $card->color_theme,
            ]
        ]);
    }

    /**
     * Update specific card
     */
    public function updateCard(Request $request, $id)
    {
        $user = Auth::user();
        $card = $user->cards()->where('id', $id)->firstOrFail();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'website' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'instagram' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'twitter' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|string|max:500',
            'logo' => 'nullable|string|max:500',
            'color_theme' => 'required|in:blue,green,purple,pink,orange,dark',
        ]);

        try {
            $card->update($validated);
            
            Log::info('Client updated card', [
                'user_id' => $user->id,
                'card_id' => $card->id,
                'updated_fields' => array_keys($validated)
            ]);
            
            return redirect()->route('client.dashboard')->with('success', 'Cartão atualizado com sucesso!');
            
        } catch (\Exception $e) {
            Log::error('Client card update failed', [
                'user_id' => $user->id,
                'card_id' => $card->id,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['error' => 'Erro ao atualizar cartão. Tente novamente.']);
        }
    }

    /**
     * Delete specific card
     */
    public function deleteCard($id)
    {
        $user = Auth::user();
        $card = $user->cards()->where('id', $id)->firstOrFail();
        
        try {
            // Delete associated files if they exist
            if ($card->profile_picture) {
                $profilePath = str_replace(asset('storage/'), '', $card->profile_picture);
                if (Storage::disk('public')->exists($profilePath)) {
                    Storage::disk('public')->delete($profilePath);
                }
            }
            
            if ($card->logo) {
                $logoPath = str_replace(asset('storage/'), '', $card->logo);
                if (Storage::disk('public')->exists($logoPath)) {
                    Storage::disk('public')->delete($logoPath);
                }
            }
            
            $card->delete();
            
            Log::info('Client deleted card', [
                'user_id' => $user->id,
                'card_id' => $card->id,
                'card_name' => $card->name
            ]);
            
            return response()->json([
                'success' => true, 
                'message' => 'Cartão excluído com sucesso!'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Client card deletion failed', [
                'user_id' => $user->id,
                'card_id' => $card->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir cartão. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Duplicate specific card
     */
    public function duplicateCard($id)
    {
        $user = Auth::user();
        $originalCard = $user->cards()->where('id', $id)->firstOrFail();
        
        try {
            $newCard = $originalCard->replicate();
            $newCard->name = $originalCard->name . ' (Cópia)';
            $newCard->code = \Str::random(6);
            $newCard->unique_slug = \Str::random(10);
            $newCard->click_count = 0;
            $newCard->activation_code = null; // Don't copy activation codes
            $newCard->save();
            
            Log::info('Client duplicated card', [
                'user_id' => $user->id,
                'original_card_id' => $originalCard->id,
                'new_card_id' => $newCard->id
            ]);
            
            return response()->json([
                'success' => true, 
                'message' => 'Cartão duplicado com sucesso!',
                'card' => [
                    'id' => $newCard->id,
                    'name' => $newCard->name,
                    'code' => $newCard->code
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Client card duplication failed', [
                'user_id' => $user->id,
                'card_id' => $originalCard->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao duplicar cartão. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Toggle card status
     */
    public function toggleCardStatus($id)
    {
        $user = Auth::user();
        $card = $user->cards()->where('id', $id)->firstOrFail();
        
        try {
            $card->status = $card->status === 'activated' ? 'draft' : 'activated';
            $card->save();
            
            Log::info('Client toggled card status', [
                'user_id' => $user->id,
                'card_id' => $card->id,
                'new_status' => $card->status
            ]);
            
            return response()->json([
                'success' => true,
                'status' => $card->status,
                'message' => $card->status === 'activated' ? 'Cartão ativado!' : 'Cartão desativado!'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Client card status toggle failed', [
                'user_id' => $user->id,
                'card_id' => $card->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao alterar status do cartão.'
            ], 500);
        }
    }

    /**
     * Get analytics for specific card
     */
    public function getCardAnalytics($id)
    {
        $user = Auth::user();
        $card = $user->cards()->where('id', $id)->firstOrFail();
        
        $analytics = $this->getCardAnalyticsData($card);
        
        return response()->json($analytics);
    }

    /**
     * Show legacy single card dashboard (for backward compatibility)
     */
    public function showMyCard()
    {
        $user = Auth::user();
        $card = $user->cards()->latest()->first();
        
        if (!$card) {
            return redirect()->route('card.create')->with('info', 'Crie seu primeiro cartão digital!');
        }
        
        return $this->editCard($card->id);
    }

    /**
     * Update legacy single card (for backward compatibility)
     */
    public function updateMyCard(Request $request)
    {
        $user = Auth::user();
        $card = $user->cards()->latest()->first();
        
        if (!$card) {
            return back()->withErrors(['error' => 'Cartão não encontrado.']);
        }
        
        return $this->updateCard($request, $card->id);
    }

    /**
     * Legacy analytics method (for backward compatibility)
     */
    public function analytics()
    {
        $user = Auth::user();
        $card = $user->cards()->latest()->first();
        
        if (!$card) {
            return response()->json(['error' => 'Card not found'], 404);
        }
        
        return $this->getCardAnalytics($card->id);
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Map database color theme to frontend theme
     */
    private function mapColorTheme($theme)
    {
        $themeMap = [
            'blue' => 'gradient-blue',
            'green' => 'gradient-green', 
            'purple' => 'gradient-purple',
            'pink' => 'gradient-red',
            'orange' => 'gradient-orange',
            'dark' => 'gradient-purple',
        ];
        return $themeMap[$theme] ?? 'gradient-purple';
    }

    /**
     * Get user's plan based on their cards
     */
    private function getUserPlan($user)
    {
        $hasPremiumCards = $user->cards()
            ->whereNotNull('activation_code')
            ->exists();
        return $hasPremiumCards ? 'Premium' : 'Free';
    }

    /**
     * Get analytics data for a card
     */
    private function getCardAnalyticsData($card)
    {
        try {
            $today = Carbon::today();
            $thisWeek = Carbon::now()->startOfWeek();
            $thisMonth = Carbon::now()->startOfMonth();
            
            // Get activation data if available
            $totalViews = $card->click_count ?? 0;
            $activations = $card->activations ?? collect();
            
            $viewsToday = $activations->where('created_at', '>=', $today)->count();
            $viewsThisWeek = $activations->where('created_at', '>=', $thisWeek)->count();
            $viewsThisMonth = $activations->where('created_at', '>=', $thisMonth)->count();
            
            // Device breakdown
            $deviceStats = $this->getDeviceBreakdown($activations);
            
            // Daily views for chart (last 7 days)
            $dailyViews = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $count = $activations->where('created_at', '>=', $date->startOfDay())
                                   ->where('created_at', '<=', $date->endOfDay())
                                   ->count();
                $dailyViews[] = [
                    'date' => $date->format('d/m'),
                    'views' => $count
                ];
            }
            
            return [
                'total_views' => $totalViews,
                'views_today' => $viewsToday,
                'views_this_week' => $viewsThisWeek,
                'views_this_month' => $viewsThisMonth,
                'device_stats' => $deviceStats,
                'daily_views' => $dailyViews,
                'created_date' => $card->created_at->format('d/m/Y'),
                'last_updated' => $card->updated_at->format('d/m/Y H:i'),
            ];
            
        } catch (\Exception $e) {
            Log::error('Analytics calculation failed', [
                'card_id' => $card->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'total_views' => $card->click_count ?? 0,
                'views_today' => 0,
                'views_this_week' => 0,
                'views_this_month' => 0,
                'device_stats' => [],
                'daily_views' => [],
                'created_date' => $card->created_at->format('d/m/Y'),
                'last_updated' => $card->updated_at->format('d/m/Y H:i'),
            ];
        }
    }

    /**
     * Get device breakdown from activations
     */
    private function getDeviceBreakdown($activations)
    {
        $devices = ['Mobile' => 0, 'Desktop' => 0, 'Tablet' => 0];
        
        foreach ($activations as $activation) {
            $userAgent = strtolower($activation->user_agent ?? '');
            
            if (strpos($userAgent, 'mobile') !== false || strpos($userAgent, 'android') !== false) {
                $devices['Mobile']++;
            } elseif (strpos($userAgent, 'tablet') !== false || strpos($userAgent, 'ipad') !== false) {
                $devices['Tablet']++;
            } else {
                $devices['Desktop']++;
            }
        }
        
        return array_map(function($device, $count) {
            return ['name' => $device, 'value' => $count];
        }, array_keys($devices), $devices);
    }

    /**
     * Get public URL for card
     */
    private function getPublicUrl($card)
    {
        if ($card->unique_slug) {
            return route('card.public', $card->unique_slug);
        }
        
        return route('card.view.code', $card->code);
    }

    /**
     * Get short URL for card
     */
    private function getShortUrl($card)
    {
        $baseUrl = config('app.frontend_url', config('app.url'));
        return $baseUrl . '/c/' . $card->code;
    }

    /**
     * Get sharing options for card
     */
    private function getSharingOptions($card)
    {
        $publicUrl = $this->getPublicUrl($card);
        $shortUrl = $this->getShortUrl($card);
        
        $whatsappMessage = "👋 Olá! Confira meu cartão digital: " . $shortUrl;
        $whatsappUrl = "https://api.whatsapp.com/send?text=" . urlencode($whatsappMessage);
        
        $emailSubject = "Cartão Digital - " . $card->name;
        $emailBody = "Olá!\n\nGostaria de compartilhar meu cartão digital com você.\n\nVer cartão: " . $shortUrl . "\n\nAtenciosamente,\n" . $card->name;
        $mailtoUrl = "mailto:?subject=" . urlencode($emailSubject) . "&body=" . urlencode($emailBody);
        
        $smsMessage = "Confira meu cartão digital: " . $shortUrl;
        $smsUrl = "sms:?body=" . urlencode($smsMessage);
        
        return [
            'public_url' => $publicUrl,
            'short_url' => $shortUrl,
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
                'twitter' => "https://twitter.com/intent/tweet?text=" . urlencode("Confira meu cartão digital: " . $shortUrl),
                'linkedin' => "https://www.linkedin.com/sharing/share-offsite/?url=" . urlencode($shortUrl),
                'facebook' => "https://www.facebook.com/sharer/sharer.php?u=" . urlencode($shortUrl)
            ]
        ];
    }
}