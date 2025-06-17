<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\ActivationCode;

class ActivationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $activationCode;

    public function __construct(ActivationCode $activationCode)
    {
        $this->activationCode = $activationCode;
    }

    public function build()
    {
        $planNames = [
            'basic' => 'Básico',
            'premium' => 'Premium', 
            'business' => 'Empresarial'
        ];

        return $this->subject('Seu Cartão Digital foi Adquirido com Sucesso! - Capinha Digital')
                    ->view('emails.activation-code')
                    ->with([
                        'customer_name' => $this->activationCode->customer_name,
                        'activation_code' => $this->activationCode->code,
                        'plan_name' => $planNames[$this->activationCode->plan] ?? $this->activationCode->plan,
                        'amount' => $this->activationCode->amount,
                        'payment_method' => $this->activationCode->payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito',
                        'creation_url' => route('card.create', ['activation_code' => $this->activationCode->code]),
                        'support_email' => 'suporte@capinhadigital.com.br',
                        'company_name' => 'Capinha Digital',
                    ]);
    }
}