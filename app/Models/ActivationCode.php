<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ActivationCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'status',
        'plan',
        'amount',
        'customer_name',
        'customer_email', 
        'customer_phone',
        'payment_method',
        'payment_id',
        'sold_at',
        'activated_at'
    ];

    protected $casts = [
        'sold_at' => 'datetime',
        'activated_at' => 'datetime',
    ];

    public static function generateCode(): string
    {
        do {
            $code = 'CD-' . strtoupper(Str::random(6));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function card()
    {
        return $this->hasOne(Card::class, 'activation_code', 'code');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    public function scopeActivated($query)
    {
        return $query->where('status', 'activated');
    }
}