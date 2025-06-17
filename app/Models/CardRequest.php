<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CardRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        // Basic Information
        'name',
        'job_title',
        'company',
        'bio',
        
        // Contact Information
        'email',
        'phone',
        'whatsapp',
        'website',
        'location',
        
        // Social Media
        'instagram',
        'linkedin',
        'twitter',
        'facebook',
        
        // Visual Elements
        'profile_picture',
        'logo',
        'color_theme',
        
        // System Fields
        'status',
        'activation_code',
        'notes', // Admin notes
        'processed_at', // When converted to card
        'processed_by', // Which admin processed it
    ];

    protected $casts = [
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
        'color_theme' => 'blue',
    ];

    /**
     * Get the admin who processed this request
     */
    public function processedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'processed_by');
    }

    /**
     * Get the card created from this request
     */
    public function card()
    {
        return $this->hasOne(\App\Models\Card::class, 'request_id', 'id');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for processed requests
     */
    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }

    /**
     * Mark request as processed
     */
    public function markAsProcessed($adminId = null)
    {
        $this->update([
            'status' => 'processed',
            'processed_at' => now(),
            'processed_by' => $adminId ?: auth()->id(),
        ]);
    }

    /**
     * Get display name with title
     */
    public function getDisplayNameAttribute()
    {
        if ($this->job_title && $this->company) {
            return $this->name . ' - ' . $this->job_title . ' at ' . $this->company;
        } elseif ($this->job_title) {
            return $this->name . ' - ' . $this->job_title;
        }
        
        return $this->name;
    }

    /**
     * Get primary contact method
     */
    public function getPrimaryContactAttribute()
    {
        return $this->email ?: $this->whatsapp ?: $this->phone ?: 'Não informado';
    }

    /**
     * Check if request has complete information
     */
    public function isComplete()
    {
        return !empty($this->name) && 
               (!empty($this->email) || !empty($this->phone) || !empty($this->whatsapp));
    }
}