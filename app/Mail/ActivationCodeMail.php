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
        return $this->subject('Seu código de ativação - Capinha Digital')
                    ->view('emails.activation-code');
    }
}