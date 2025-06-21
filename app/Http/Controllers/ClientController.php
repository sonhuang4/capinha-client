<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Card;

class ClientController extends Controller
{
    /**
     * Smart redirect after login
     */
    public function authRedirect()
    {
        $user = Auth::user();
        return $user->role === 'admin'
            ? redirect()->route('dashboard')
            : redirect()->route('client/dashboard');
    }

    /**
     * Client dashboard - show user's cards
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        $cards = Card::where('user_id', $user->id)
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
                    'downloads' => rand(5, 50),
                    'status' => $card->status,
                    'isPremium' => !empty($card->activation_code),
                    'createdAt' => $card->created_at->format('Y-m-d'),
                    'createdAtFormatted' => $card->created_at->format('d/m/Y'),
                    'cardUrl' => $this->getPublicUrl($card),
                    'editUrl' => route('client.cards.edit', $card->id),
                    // FIX: Remove or fix the QR URL
                    'qrUrl' => null, // Temporarily set to null
                    // OR use a route that exists:
                    // 'qrUrl' => $card->unique_slug ? route('cards.qr', $card->id) : null,
                ];
            });

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
            'stats' => [
                'totalCards' => $cards->count(),
                'totalViews' => $cards->sum('views'),
                'totalDownloads' => $cards->sum('downloads'),
                'activeCards' => $cards->where('status', 'activated')->count(),
                'premiumCards' => $cards->where('isPremium', true)->count(),
            ]
        ]);
    }
    /**
     * Show edit form for card
     */
    public function edit($id)
    {
        $user = Auth::user();
        $card = Card::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        
        return Inertia::render('RequestCardForm', [
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
     * Update card
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $card = Card::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        
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

        // Check at least one contact method
        if (empty($validated['email']) && empty($validated['phone']) && empty($validated['whatsapp'])) {
            return back()->withErrors([
                'contact' => 'Pelo menos um meio de contato é obrigatório (email, telefone ou WhatsApp).'
            ]);
        }

        $card->update($validated);
        
        Log::info('Card updated', [
            'user_id' => $user->id,
            'card_id' => $card->id
        ]);
        
        return redirect()->route('client.dashboard')->with('success', 'Cartão atualizado com sucesso!');
    }

    /**
     * Delete card
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $card = Card::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        
        // Delete associated files
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
        
        return response()->json(['success' => true, 'message' => 'Cartão excluído com sucesso!']);
    }

    /**
     * Duplicate card
     */
    public function duplicate($id)
    {
        $user = Auth::user();
        $originalCard = Card::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        
        $newCard = $originalCard->replicate();
        $newCard->name = $originalCard->name . ' (Cópia)';
        $newCard->code = \Str::random(6);
        $newCard->unique_slug = \Str::random(10);
        $newCard->click_count = 0;
        $newCard->activation_code = null;
        $newCard->save();
        
        return response()->json(['success' => true, 'message' => 'Cartão duplicado com sucesso!']);
    }

    /**
     * Toggle card status
     */
    public function toggleStatus($id)
    {
        $user = Auth::user();
        $card = Card::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        
        $card->status = $card->status === 'activated' ? 'draft' : 'activated';
        $card->save();
        
        return response()->json([
            'success' => true,
            'status' => $card->status,
            'message' => $card->status === 'activated' ? 'Cartão ativado!' : 'Cartão desativado!'
        ]);
    }

    /**
     * Get card analytics
     */
    public function analytics($id)
    {
        $user = Auth::user();
        $card = Card::where('user_id', $user->id)->where('id', $id)->firstOrFail();
        
        // Return analytics data
        return response()->json([
            'total_views' => $card->click_count ?? 0,
            'views_today' => 0, // Implement as needed
            'views_this_week' => 0, // Implement as needed
            'views_this_month' => 0, // Implement as needed
        ]);
    }

    // Helper methods
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

    private function getUserPlan($user)
    {
        $hasPremiumCards = Card::where('user_id', $user->id)
            ->whereNotNull('activation_code')
            ->exists();
        return $hasPremiumCards ? 'Premium' : 'Free';
    }

    private function getPublicUrl($card)
    {
        if ($card->unique_slug) {
            return route('card.public', $card->unique_slug);
        }
        return route('card.view.code', $card->code);
    }
}