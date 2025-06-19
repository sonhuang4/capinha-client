<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_id',
        'status',
        'plan',
        'amount',
        'currency',
        'payment_method',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_document',
        'gateway',
        'gateway_payment_id',
        'gateway_response',
        'pix_code',
        'pix_qr_code',
        'pix_expires_at',
        'card_id',
        'card_created_at',
        'paid_at',
        'failed_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'pix_expires_at' => 'datetime',
        'card_created_at' => 'datetime',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    /**
     * Get the user who made this payment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the card created from this payment
     */
    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    // ========================================
    // SCOPES
    // ========================================

    /**
     * Scope for pending payments
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for paid payments
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope for failed payments
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for today's payments
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope for this month's payments
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }

    // ========================================
    // ACCESSORS & MUTATORS
    // ========================================

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return 'R$ ' . number_format($this->amount, 2, ',', '.');
    }

    /**
     * Get plan name in Portuguese
     */
    public function getPlanNameAttribute()
    {
        $plans = [
            'basic' => 'Básico',
            'premium' => 'Premium',
            'business' => 'Empresarial'
        ];

        return $plans[$this->plan] ?? 'Desconhecido';
    }

    /**
     * Get status name in Portuguese
     */
    public function getStatusNameAttribute()
    {
        $statuses = [
            'pending' => 'Pendente',
            'processing' => 'Processando',
            'paid' => 'Pago',
            'failed' => 'Falhou',
            'refunded' => 'Reembolsado',
            'cancelled' => 'Cancelado'
        ];

        return $statuses[$this->status] ?? 'Desconhecido';
    }

    /**
     * Get payment method name
     */
    public function getPaymentMethodNameAttribute()
    {
        $methods = [
            'pix' => 'PIX',
            'credit_card' => 'Cartão de Crédito',
            'boleto' => 'Boleto',
            'debit_card' => 'Cartão de Débito'
        ];

        return $methods[$this->payment_method] ?? 'Desconhecido';
    }

    /**
     * Check if payment is expired (for PIX)
     */
    public function getIsExpiredAttribute()
    {
        if ($this->payment_method === 'pix' && $this->pix_expires_at) {
            return Carbon::parse($this->pix_expires_at)->isPast();
        }

        return false;
    }

    /**
     * Get time until expiration
     */
    public function getTimeUntilExpiryAttribute()
    {
        if ($this->payment_method === 'pix' && $this->pix_expires_at) {
            $expiryTime = Carbon::parse($this->pix_expires_at);
            
            if ($expiryTime->isPast()) {
                return 'Expirado';
            }

            return $expiryTime->diffForHumans(null, true);
        }

        return null;
    }

    // ========================================
    // STATIC METHODS
    // ========================================

    /**
     * Generate unique payment ID
     */
    public static function generatePaymentId()
    {
        do {
            $paymentId = 'PAY-' . strtoupper(Str::random(8));
        } while (self::where('payment_id', $paymentId)->exists());

        return $paymentId;
    }

    /**
     * Get plan pricing
     */
    public static function getPlanPricing()
    {
        return [
            'basic' => [
                'name' => 'Básico',
                'price' => 39.90,
                'features' => [
                    'Cartão digital personalizado',
                    'QR Code dinâmico',
                    'Links para redes sociais',
                    'Edição ilimitada',
                    'Suporte por email'
                ]
            ],
            'premium' => [
                'name' => 'Premium',
                'price' => 69.90,
                'features' => [
                    'Tudo do plano Básico',
                    'Analytics detalhado',
                    'Logo personalizada',
                    'Múltiplos temas de cor',
                    'Suporte prioritário',
                    'Download vCard'
                ]
            ],
            'business' => [
                'name' => 'Empresarial',
                'price' => 199.90,
                'features' => [
                    'Tudo do plano Premium',
                    'Até 5 cartões digitais',
                    'Gestão centralizada',
                    'Branding corporativo',
                    'Relatórios avançados'
                ]
            ]
        ];
    }

    // ========================================
    // METHODS
    // ========================================

    /**
     * Mark payment as paid
     */
    public function markAsPaid($gatewayResponse = null)
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'gateway_response' => $gatewayResponse,
        ]);
    }

    /**
     * Mark payment as failed
     */
    public function markAsFailed($gatewayResponse = null)
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'gateway_response' => $gatewayResponse,
        ]);
    }

    /**
     * Mark payment as refunded
     */
    public function markAsRefunded()
    {
        $this->update([
            'status' => 'refunded',
            'refunded_at' => now(),
        ]);
    }

    /**
     * Link payment to created card
     */
    public function linkToCard(Card $card)
    {
        $this->update([
            'card_id' => $card->id,
            'card_created_at' => now(),
        ]);
    }

    /**
     * Check if user can create card (payment is paid)
     */
    public function canCreateCard()
    {
        return $this->status === 'paid' && is_null($this->card_id);
    }
}