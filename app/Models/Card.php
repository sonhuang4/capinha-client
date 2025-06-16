<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        // Existing fields
        'name',
        'email',
        'profile_picture',
        'logo',
        'whatsapp',
        'instagram',
        'website',
        'color_theme',
        'status',
        'code',
        'click_count',
        
        // NEW FIELDS for purchase system
        'activation_code',
        'unique_slug',
        'job_title',
        'company',
        'phone',
        'location',
        'bio',
        'linkedin',
        'twitter',
        'facebook',
        'analytics_data',
    ];

    protected $casts = [
        'analytics_data' => 'array',
        'click_count' => 'integer',
    ];

    // Existing relationships
    public function activations()
    {
        return $this->hasMany(\App\Models\Activation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // NEW RELATIONSHIP - Link to activation code
    public function activationCodeRecord()
    {
        return $this->belongsTo(ActivationCode::class, 'activation_code', 'code');
    }

    // HELPER METHODS
    
    /**
     * Get the public URL for this card
     */
    public function getPublicUrlAttribute()
    {
        $baseUrl = config('app.frontend_url', config('app.url'));
        
        // Use unique_slug if available, fallback to code
        $identifier = $this->unique_slug ?: $this->code;
        
        return $baseUrl . '/c/' . $identifier;
    }

    /**
     * Get short link for sharing
     */
    public function getShortLinkAttribute()
    {
        return $this->public_url;
    }

    /**
     * Check if card is activated
     */
    public function isActivated()
    {
        return $this->status === 'activated';
    }

    /**
     * Check if card was created through purchase flow
     */
    public function isPurchased()
    {
        return !empty($this->activation_code);
    }

    /**
     * Get display name with job title
     */
    public function getFullTitleAttribute()
    {
        if ($this->job_title && $this->company) {
            return $this->job_title . ' at ' . $this->company;
        } elseif ($this->job_title) {
            return $this->job_title;
        } elseif ($this->company) {
            return 'at ' . $this->company;
        }
        
        return null;
    }

    /**
     * Get formatted social media links
     */
    public function getSocialLinksAttribute()
    {
        $links = [];
        
        if ($this->instagram) {
            $links['instagram'] = str_starts_with($this->instagram, 'http') 
                ? $this->instagram 
                : 'https://instagram.com/' . ltrim($this->instagram, '@/');
        }
        
        if ($this->linkedin) {
            $links['linkedin'] = str_starts_with($this->linkedin, 'http') 
                ? $this->linkedin 
                : 'https://linkedin.com/in/' . ltrim($this->linkedin, '@/');
        }
        
        if ($this->twitter) {
            $links['twitter'] = str_starts_with($this->twitter, 'http') 
                ? $this->twitter 
                : 'https://twitter.com/' . ltrim($this->twitter, '@/');
        }
        
        if ($this->facebook) {
            $links['facebook'] = str_starts_with($this->facebook, 'http') 
                ? $this->facebook 
                : 'https://facebook.com/' . ltrim($this->facebook, '@/');
        }
        
        return $links;
    }

    /**
     * Scope for activated cards
     */
    public function scopeActivated($query)
    {
        return $query->where('status', 'activated');
    }

    /**
     * Scope for pending cards
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for purchased cards (have activation code)
     */
    public function scopePurchased($query)
    {
        return $query->whereNotNull('activation_code');
    }

    /**
     * Scope for admin-created cards (no activation code)
     */
    public function scopeAdminCreated($query)
    {
        return $query->whereNull('activation_code');
    }
}