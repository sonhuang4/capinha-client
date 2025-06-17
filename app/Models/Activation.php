<?php
// Create file: app/Models/Activation.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activation extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'ip_address',
        'user_agent',
        'location',
        'device_type',
        'referrer'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the card that owns the activation
     */
    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    /**
     * Get device type from user agent
     */
    public function getDeviceTypeAttribute()
    {
        if (!$this->user_agent) return 'unknown';
        
        $userAgent = strtolower($this->user_agent);
        
        if (strpos($userAgent, 'mobile') !== false || strpos($userAgent, 'android') !== false) {
            return 'mobile';
        } elseif (strpos($userAgent, 'tablet') !== false || strpos($userAgent, 'ipad') !== false) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    /**
     * Scope for recent activations
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope for today's activations
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope for this week's activations
     */
    public function scopeThisWeek($query)
    {
        return $query->whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    /**
     * Scope for this month's activations
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }
}