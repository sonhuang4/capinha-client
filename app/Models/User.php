<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',      
        'is_active'  
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Helper methods
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }

    // Relationship with cards (for future)
    public function cards()
    {
        return $this->hasMany(\App\Models\Card::class, 'user_id');
    }


    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for inactive users
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope for admin users
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope for client users
     */
    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    /**
     * Get user's total card views
     */
    public function getTotalCardViewsAttribute()
    {
        return $this->cards->sum('click_count');
    }

    /**
     * Get user's cards count
     */
    public function getCardsCountAttribute()
    {
        return $this->cards->count();
    }

    /**
     * Get user's active cards count
     */
    public function getActiveCardsCountAttribute()
    {
        return $this->cards->where('status', 'activated')->count();
    }

    /**
     * Check if user has cards
     */
    public function hasCards()
    {
        return $this->cards()->exists();
    }

    /**
     * Get user's most viewed card
     */
    public function getMostViewedCard()
    {
        return $this->cards()->orderByDesc('click_count')->first();
    }

    /**
     * Get user's recent activity
     */
    public function getRecentActivity()
    {
        return $this->cards()
            ->orderByDesc('updated_at')
            ->take(5)
            ->get();
    }
}
