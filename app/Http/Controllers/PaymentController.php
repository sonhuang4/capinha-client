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
        // FIXED: Updated validation to match frontend data structure
        $validated = $request->validate([
            'plan' => 'required|in:basic,premium,business',
            'payment_method' => 'required|in:pix,credit',
            'amount' => 'required|numeric|min:0',
            'customer' => 'required|array',                    // ADDED: Validate customer as array
            'customer.name' => 'required|string|max:255',
            'customer.email' => 'required|email|max:255',
            'customer.phone' => 'required|string|max:20',
            'customer.document' => 'nullable|string|max:14',
        ]);

        try {
            // Generate activation code
            $activationCode = ActivationCode::create([
                'code' => ActivationCode::generateCode(),
                'status' => 'sold',
                'plan' => $validated['plan'],
                'amount' => $validated['amount'],
                'customer_name' => $validated['customer']['name'],      // FIXED: Access nested array
                'customer_email' => $validated['customer']['email'],    // FIXED: Access nested array
                'customer_phone' => $validated['customer']['phone'],    // FIXED: Access nested array
                'payment_method' => $validated['payment_method'],
                'payment_id' => 'PAY-' . time() . '-' . rand(1000, 9999), // Better payment ID
                'sold_at' => now(),
            ]);

            // Send email with activation code
            try {
                Mail::to($validated['customer']['email'])
                    ->send(new ActivationCodeMail($activationCode));
                    
                Log::info('Activation email sent successfully', [
                    'code' => $activationCode->code,
                    'email' => $validated['customer']['email']
                ]);
            } catch (\Exception $mailError) {
                Log::error('Failed to send activation email', [
                    'code' => $activationCode->code,
                    'email' => $validated['customer']['email'],
                    'error' => $mailError->getMessage()
                ]);
                // Continue even if email fails - data is already saved!
            }

            // Log the successful purchase
            Log::info('Purchase completed successfully', [
                'activation_code' => $activationCode->code,
                'customer_email' => $validated['customer']['email'],
                'plan' => $validated['plan'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method']
            ]);

            // FIXED: Redirect to success page first, then to card creation
            return redirect()->route('purchase.success', [
                'code' => $activationCode->code
            ])->with('success', 'Compra realizada com sucesso! Verifique seu email.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed in purchase', [
                'errors' => $e->errors(),
                'input_data' => $request->except(['customer.document']) // Don't log sensitive data
            ]);
            
            return back()
                ->withErrors($e->errors())
                ->withInput();
                
        } catch (\Exception $e) {
            Log::error('Purchase processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'customer_email' => $validated['customer']['email'] ?? 'unknown'
            ]);

            return back()
                ->withErrors(['payment' => 'Erro no processamento do pagamento. Tente novamente.'])
                ->withInput();
        }
    }

    // FIXED: Added proper success method
    public function success(Request $request)
    {
        $code = $request->query('code');
        
        if (!$code) {
            return redirect()->route('home')->with('error', 'Código de ativação não encontrado.');
        }

        $activationCode = ActivationCode::where('code', $code)->first();
        
        if (!$activationCode) {
            return redirect()->route('home')->with('error', 'Código de ativação inválido.');
        }

        return Inertia::render('PurchaseSuccess', [
            'activation_code' => [
                'code' => $activationCode->code,
                'plan' => $activationCode->plan,
                'amount' => $activationCode->amount,
                'customer_name' => $activationCode->customer_name,
                'customer_email' => $activationCode->customer_email,
                'payment_method' => $activationCode->payment_method,
                'sold_at' => $activationCode->sold_at->toISOString(),
            ],
            'card_creation_url' => route('card.create', ['activation_code' => $activationCode->code])
        ]);
    }

    // Webhook for real payment gateway (PIX/Credit Card)
    public function webhook(Request $request)
    {
        try {
            $paymentId = $request->input('payment_id');
            $status = $request->input('status');

            Log::info('Payment webhook received', [
                'payment_id' => $paymentId,
                'status' => $status,
                'payload' => $request->all()
            ]);

            if ($status === 'approved' && $paymentId) {
                $activationCode = ActivationCode::where('payment_id', $paymentId)->first();
                
                if ($activationCode && $activationCode->status === 'pending') {
                    $activationCode->update(['status' => 'sold']);
                    
                    // Send activation email
                    try {
                        Mail::to($activationCode->customer_email)
                            ->send(new ActivationCodeMail($activationCode));
                    } catch (\Exception $mailError) {
                        Log::error('Failed to send webhook activation email', [
                            'code' => $activationCode->code,
                            'error' => $mailError->getMessage()
                        ]);
                    }
                    
                    Log::info('Payment approved and activation code updated', [
                        'code' => $activationCode->code
                    ]);
                }
            }

            return response()->json(['status' => 'ok']);
            
        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);
            
            return response()->json(['status' => 'error'], 500);
        }
    }
}