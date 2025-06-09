<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'code', 'status', 'name', 'company_name', 'job_title',
        'phone', 'email', 'whatsapp', 'instagram', 'linkedin', 'website',
        'facebook', 'photo_url', 'logo_url', 'bio', 'address'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function getPublicUrl()
    {
        return url("/c/{$this->code}");
    }

    // Auto-generate unique code
    public static function generateUniqueCode()
    {
        do {
            $code = strtoupper(Str::random(6)); // e.g., "A1B2C3"
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
