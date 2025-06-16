<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\ActivationCode;
use App\Mail\ActivationCodeMail;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function process(Request $request)
    {
        $validated = $request->validate([
            'plan' => 'required|in:basic,premium,business',
            'payment_method' => 'required|in:pix,credit',
            'customer.name' => 'required|string|max:255',
            'customer.email' => 'required|email|max:255',
            'customer.phone' => 'required|string|max:20',
            'customer.document' => 'nullable|string|max:14',
            'amount' => 'required|numeric|min:0',
        ]);

        try {
            // Generate activation code
            $activationCode = ActivationCode::create([
                'code' => ActivationCode::generateCode(),
                'status' => 'sold',
                'plan' => $validated['plan'],
                'amount' => $validated['amount'],
                'customer_name' => $validated['customer']['name'],
                'customer_email' => $validated['customer']['email'],
                'customer_phone' => $validated['customer']['phone'],
                'payment_method' => $validated['payment_method'],
                'payment_id' => 'DEMO-' . time(), // Replace with real payment ID
                'sold_at' => now(),
            ]);

            // Send email with activation code
            Mail::to($validated['customer']['email'])
                ->send(new ActivationCodeMail($activationCode));

            // Log the purchase
            Log::info('Purchase completed', [
                'code' => $activationCode->code,
                'email' => $validated['customer']['email'],
                'plan' => $validated['plan']
            ]);

            // Redirect to card creation with activation code
            return redirect()->route('card.create')
                ->with('activation_code', $activationCode->code)
                ->with('customer_data', $validated['customer'])
                ->with('success', 'Compra realizada com sucesso! Verifique seu email.');

        } catch (\Exception $e) {
            dd($e->getMessage(), $e->getTraceAsString());
            Log::error('Purchase failed', [
                'error' => $e->getMessage(),
                'email' => $validated['customer']['email'] ?? 'unknown'
            ]);

            return back()
                ->withErrors(['payment' => 'Erro no processamento do pagamento. Tente novamente.'])
                ->withInput();
        }
    }

    public function success()
    {
        return Inertia::render('PaymentSuccess');
    }

    // Webhook for real payment gateway (PIX/Credit Card)
    public function webhook(Request $request)
    {
        // Handle payment gateway webhooks
        $paymentId = $request->input('payment_id');
        $status = $request->input('status');

        if ($status === 'approved') {
            $activationCode = ActivationCode::where('payment_id', $paymentId)->first();
            
            if ($activationCode && $activationCode->status === 'pending') {
                $activationCode->update(['status' => 'sold']);
                
                // Send activation email
                Mail::to($activationCode->customer_email)
                    ->send(new ActivationCodeMail($activationCode));
            }
        }

        return response()->json(['status' => 'ok']);
    }
}