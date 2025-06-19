<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Card;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * Show purchase page with plans
     */
    public function index(Request $request)
    {
        $selectedPlan = $request->get('plan', 'basic');
        $plans = Payment::getPlanPricing();
        
        return Inertia::render('Purchase', [
            'plans' => $plans,
            'selectedPlan' => $selectedPlan,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Process payment creation
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'plan' => 'required|in:basic,premium,business',
            'payment_method' => 'required|in:pix,credit_card',
            'customer.name' => 'required|string|max:255',
            'customer.email' => 'required|email|max:255',
            'customer.phone' => 'nullable|string|max:20',
            'customer.document' => 'nullable|string|max:20',
        ]);

        try {
            $plans = Payment::getPlanPricing();
            $plan = $plans[$validated['plan']];
            $customer = $validated['customer'];

            // Create or get user
            $user = Auth::user();
            if (!$user) {
                // Create new user if not logged in
                $user = \App\Models\User::firstOrCreate([
                    'email' => $customer['email']
                ], [
                    'name' => $customer['name'],
                    'password' => bcrypt(\Illuminate\Support\Str::random(12)),
                    'email_verified_at' => now(),
                    'role' => 'client',
                ]);
                
                Auth::login($user);
            }

            // Create payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'payment_id' => Payment::generatePaymentId(),
                'status' => 'pending',
                'plan' => $validated['plan'],
                'amount' => $plan['price'],
                'payment_method' => $validated['payment_method'],
                'customer_name' => $customer['name'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'] ?? null,
                'customer_document' => $customer['document'] ?? null,
                'gateway' => 'mercadopago', // You can change this
            ]);

            if ($validated['payment_method'] === 'pix') {
                return $this->processPIXPayment($payment, $plan);
            } else {
                return $this->processCreditCardPayment($payment, $plan);
            }

        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'error' => $e->getMessage(),
                'request_data' => $validated,
                'user_id' => Auth::id(),
            ]);

            return back()->withErrors([
                'general' => 'Erro ao processar pagamento: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Process PIX payment
     */
    private function processPIXPayment($payment, $plan)
    {
        // Generate PIX data (simplified version)
        $pixData = $this->generatePIXData($payment);
        
        // Update payment with PIX data
        $payment->update([
            'pix_code' => $pixData['pix_code'],
            'pix_qr_code' => $pixData['qr_code_url'],
            'pix_expires_at' => now()->addMinutes(30), // 30 minutes to pay
            'gateway_payment_id' => $pixData['payment_id'],
        ]);

        // Send PIX instructions email
        $this->sendPIXInstructions($payment, $pixData);

        return Inertia::render('PaymentPIX', [
            'payment' => [
                'id' => $payment->id,
                'payment_id' => $payment->payment_id,
                'amount' => $payment->amount,
                'formatted_amount' => $payment->formatted_amount,
                'plan_name' => $payment->plan_name,
                'expires_at' => $payment->pix_expires_at,
                'time_until_expiry' => $payment->time_until_expiry,
            ],
            'pix_data' => $pixData,
            'customer' => [
                'name' => $payment->customer_name,
                'email' => $payment->customer_email,
            ],
            'instructions' => [
                '1. Abra seu app do banco',
                '2. Escolha PIX → Pagar → Copiar e Colar',
                '3. Cole o código PIX abaixo',
                '4. Confirme o pagamento de ' . $payment->formatted_amount,
                '5. Após confirmação, você poderá criar seu cartão'
            ]
        ]);
    }

    /**
     * Generate PIX payment data (simplified)
     */
    private function generatePIXData($payment)
    {
        $pixKey = env('PIX_KEY', 'pix@capinhadigital.com.br');
        
        // Generate PIX code (simplified - in production use a proper PIX library)
        $pixCode = "PIX|{$pixKey}|{$payment->amount}|{$payment->payment_id}";
        
        return [
            'payment_id' => $payment->payment_id,
            'pix_key' => $pixKey,
            'amount' => $payment->amount,
            'pix_code' => $pixCode,
            'qr_code_url' => $this->generatePIXQRCode($pixCode),
        ];
    }

    /**
     * Generate PIX QR Code URL
     */
    private function generatePIXQRCode($pixCode)
    {
        $encodedPix = urlencode($pixCode);
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={$encodedPix}";
    }

    /**
     * Process credit card payment (placeholder for external gateway)
     */
    private function processCreditCardPayment($payment, $plan)
    {
        // This would integrate with Mercado Pago, PagSeguro, etc.
        // For now, redirect to external payment
        
        return redirect()->away("https://mercadopago.com/payment/{$payment->payment_id}");
    }

    /**
     * Payment webhook (for automatic payment confirmation)
     */
    public function webhook(Request $request)
    {
        try {
            // This would handle webhooks from Mercado Pago, PagSeguro, etc.
            $paymentId = $request->input('payment_id');
            $status = $request->input('status');
            
            $payment = Payment::where('payment_id', $paymentId)->first();
            
            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            if ($status === 'approved' || $status === 'paid') {
                $payment->markAsPaid($request->all());
                
                // Send payment confirmation email
                $this->sendPaymentConfirmation($payment);
                
                Log::info('Payment confirmed via webhook', [
                    'payment_id' => $payment->payment_id,
                    'user_id' => $payment->user_id,
                    'amount' => $payment->amount,
                ]);
            } else {
                $payment->markAsFailed($request->all());
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * Payment success page
     */
    public function success(Request $request)
    {
        $paymentId = $request->get('payment_id');
        
        if ($paymentId) {
            $payment = Payment::where('payment_id', $paymentId)
                            ->where('user_id', Auth::id())
                            ->first();
            
            if ($payment && $payment->status === 'paid') {
                return Inertia::render('PurchaseSuccess', [
                    'payment' => [
                        'id' => $payment->id,
                        'payment_id' => $payment->payment_id,
                        'plan_name' => $payment->plan_name,
                        'formatted_amount' => $payment->formatted_amount,
                        'payment_method_name' => $payment->payment_method_name,
                        'paid_at' => $payment->paid_at,
                        'customer_name' => $payment->customer_name,
                        'customer_email' => $payment->customer_email,
                    ],
                    'card_creation_url' => route('card.create'),
                    'can_create_card' => $payment->canCreateCard(),
                ]);
            }
        }

        return redirect()->route('purchase.index')
                        ->with('error', 'Pagamento não encontrado ou não confirmado.');
    }

    /**
     * Payment failed page
     */
    public function failed(Request $request)
    {
        return Inertia::render('PurchaseFailed', [
            'message' => 'Pagamento não foi aprovado. Tente novamente.',
            'retry_url' => route('purchase.index'),
        ]);
    }

    /**
     * Admin: View all payments
     */
    public function adminIndex()
    {
        $payments = Payment::with('user', 'card')
                          ->orderBy('created_at', 'desc')
                          ->paginate(20);

        $stats = $this->getPaymentStats();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments->through(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_id' => $payment->payment_id,
                    'status' => $payment->status,
                    'status_name' => $payment->status_name,
                    'plan' => $payment->plan,
                    'plan_name' => $payment->plan_name,
                    'amount' => $payment->amount,
                    'formatted_amount' => $payment->formatted_amount,
                    'payment_method' => $payment->payment_method,
                    'payment_method_name' => $payment->payment_method_name,
                    'customer_name' => $payment->customer_name,
                    'customer_email' => $payment->customer_email,
                    'customer_phone' => $payment->customer_phone,
                    'created_at' => $payment->created_at->format('d/m/Y H:i'),
                    'paid_at' => $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i') : null,
                    'time_ago' => $payment->created_at->diffForHumans(),
                    'user' => $payment->user ? [
                        'id' => $payment->user->id,
                        'name' => $payment->user->name,
                        'email' => $payment->user->email,
                    ] : null,
                    'card' => $payment->card ? [
                        'id' => $payment->card->id,
                        'name' => $payment->card->name,
                        'code' => $payment->card->code,
                        'url' => config('app.url') . '/c/' . $payment->card->code,
                    ] : null,
                    'can_create_card' => $payment->canCreateCard(),
                ];
            }),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ]
        ]);
    }

    /**
     * Admin: Refund payment
     */
    public function refund(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $payment = Payment::findOrFail($id);
            
            if ($payment->status !== 'paid') {
                return back()->withErrors([
                    'general' => 'Apenas pagamentos confirmados podem ser reembolsados.'
                ]);
            }

            // Mark as refunded
            $payment->markAsRefunded();
            
            // If card exists, you might want to deactivate it
            if ($payment->card) {
                $payment->card->update(['status' => 'pending']);
            }

            Log::info('Payment refunded by admin', [
                'payment_id' => $payment->payment_id,
                'admin_id' => auth()->id(),
                'reason' => $validated['reason'],
            ]);

            return back()->with('success', 'Pagamento reembolsado com sucesso!');

        } catch (\Exception $e) {
            Log::error('Refund failed', [
                'payment_id' => $id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
            ]);

            return back()->withErrors([
                'general' => 'Erro ao processar reembolso: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Admin: Export payments to CSV
     */
    public function exportPayments(Request $request)
    {
        $status = $request->get('status', 'all');
        
        $query = Payment::with('user', 'card');
        
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        $filename = 'payments_' . $status . '_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($payments) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'ID Pagamento', 'Status', 'Plano', 'Cliente', 'Email', 'Telefone', 
                'Valor', 'Método', 'Data Criação', 'Data Pagamento', 'Cartão Criado'
            ]);

            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->payment_id,
                    $payment->status_name,
                    $payment->plan_name,
                    $payment->customer_name,
                    $payment->customer_email,
                    $payment->customer_phone,
                    $payment->formatted_amount,
                    $payment->payment_method_name,
                    $payment->created_at->format('d/m/Y H:i'),
                    $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i') : '',
                    $payment->card ? 'Sim' : 'Não',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Manual payment confirmation (for PIX payments)
     */
    public function confirmPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_id' => 'required|string',
        ]);

        try {
            $payment = Payment::where('payment_id', $validated['payment_id'])
                            ->where('user_id', Auth::id())
                            ->where('status', 'pending')
                            ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pagamento não encontrado ou já processado.'
                ], 404);
            }

            // In a real scenario, you'd check with the payment gateway
            // For now, we'll assume the payment is confirmed
            $payment->markAsPaid();
            
            $this->sendPaymentConfirmation($payment);

            return response()->json([
                'success' => true,
                'message' => 'Pagamento confirmado! Você pode criar seu cartão agora.',
                'redirect_url' => route('card.create'),
            ]);

        } catch (\Exception $e) {
            Log::error('Manual payment confirmation failed', [
                'error' => $e->getMessage(),
                'payment_id' => $validated['payment_id'],
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor.'
            ], 500);
        }
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Send PIX payment instructions
     */
    private function sendPIXInstructions($payment, $pixData)
    {
        try {
            $subject = "Instruções de Pagamento PIX - Capinha Digital";
            $body = "
Olá {$payment->customer_name}!

Recebemos seu pedido do cartão digital {$payment->plan_name}.

💰 Valor: {$payment->formatted_amount}
📱 Chave PIX: {$pixData['pix_key']}
🆔 ID do Pagamento: {$payment->payment_id}

📋 CÓDIGO PIX (Copie e cole no seu app):
{$pixData['pix_code']}

⏰ Este PIX expira em 30 minutos.

Após o pagamento confirmado, você receberá acesso para criar seu cartão digital.

Dúvidas? Responda este email.

Atenciosamente,
Equipe Capinha Digital
";

            Mail::raw($body, function ($message) use ($payment, $subject) {
                $message->to($payment->customer_email, $payment->customer_name)
                        ->subject($subject);
            });

            Log::info('PIX instructions sent', [
                'payment_id' => $payment->payment_id,
                'email' => $payment->customer_email,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send PIX instructions', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->payment_id,
            ]);
        }
    }

    /**
     * Send payment confirmation email
     */
    private function sendPaymentConfirmation($payment)
    {
        try {
            $subject = "🎉 Pagamento Confirmado! Crie seu Cartão Digital";
            $body = "
Parabéns {$payment->customer_name}!

Seu pagamento foi confirmado com sucesso! 💚

📋 DETALHES DO PAGAMENTO:
• Plano: {$payment->plan_name}
• Valor: {$payment->formatted_amount}
• Método: {$payment->payment_method_name}
• ID: {$payment->payment_id}

🎨 PRÓXIMO PASSO:
Agora você pode criar seu cartão digital!

1. Acesse: " . route('card.create') . "
2. Preencha suas informações profissionais
3. Personalize cores e design
4. Compartilhe seu cartão com o mundo!

Precisa de ajuda? Responda este email.

Bem-vindo à família Capinha Digital! 🚀

Atenciosamente,
Equipe Capinha Digital
";

            Mail::raw($body, function ($message) use ($payment, $subject) {
                $message->to($payment->customer_email, $payment->customer_name)
                        ->subject($subject);
            });

            Log::info('Payment confirmation sent', [
                'payment_id' => $payment->payment_id,
                'email' => $payment->customer_email,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send payment confirmation', [
                'error' => $e->getMessage(),
                'payment_id' => $payment->payment_id,
            ]);
        }
    }

    /**
     * Get payment statistics for admin dashboard
     */
    private function getPaymentStats()
    {
        $total = Payment::count();
        $pending = Payment::pending()->count();
        $paid = Payment::paid()->count();
        $failed = Payment::failed()->count();
        
        $totalRevenue = Payment::paid()->sum('amount');
        $todayRevenue = Payment::paid()->today()->sum('amount');
        $monthRevenue = Payment::paid()->thisMonth()->sum('amount');
        
        $conversionRate = $total > 0 ? round(($paid / $total) * 100, 1) : 0;

        return [
            'total_payments' => $total,
            'pending_payments' => $pending,
            'paid_payments' => $paid,
            'failed_payments' => $failed,
            'total_revenue' => $totalRevenue,
            'today_revenue' => $todayRevenue,
            'month_revenue' => $monthRevenue,
            'conversion_rate' => $conversionRate,
            'payments_today' => Payment::today()->count(),
            'payments_this_month' => Payment::thisMonth()->count(),
        ];
    }

    public function checkPaymentStatus(Request $request)
    {
        $validated = $request->validate([
            'payment_id' => 'required|string',
        ]);

        try {
            $payment = Payment::where('payment_id', $validated['payment_id'])
                            ->where('user_id', Auth::id())
                            ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pagamento não encontrado.'
                ], 404);
            }

            if ($payment->status === 'paid') {
                return response()->json([
                    'success' => true,
                    'status' => 'paid',
                    'message' => 'Pagamento confirmado!',
                    'redirect_url' => route('card.create'),
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'status' => $payment->status,
                    'message' => 'Pagamento ainda pendente. Aguarde alguns minutos após efetuar o PIX.',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'error' => $e->getMessage(),
                'payment_id' => $validated['payment_id'],
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno. Tente novamente.'
            ], 500);
        }
    }

    /**
     * TEST ONLY: Manually confirm payment for testing
     * REMOVE THIS METHOD IN PRODUCTION!
     */
    public function testConfirmPayment(Request $request)
    {
        if (app()->environment('production')) {
            abort(404); // Don't allow in production
        }

        $validated = $request->validate([
            'payment_id' => 'required|string',
        ]);

        try {
            $payment = Payment::where('payment_id', $validated['payment_id'])
                            ->where('status', 'pending')
                            ->first();

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pagamento não encontrado ou já processado.'
                ], 404);
            }

            // Mark as paid for testing
            $payment->markAsPaid(['test' => true, 'confirmed_at' => now()]);
            
            // Send confirmation email
            $this->sendPaymentConfirmation($payment);

            Log::info('Test payment confirmed', [
                'payment_id' => $payment->payment_id,
                'user_id' => $payment->user_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pagamento confirmado para teste!',
                'redirect_url' => route('card.create'),
            ]);

        } catch (\Exception $e) {
            Log::error('Test payment confirmation failed', [
                'error' => $e->getMessage(),
                'payment_id' => $validated['payment_id'],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno.'
            ], 500);
        }
    }

    /**
     * Admin: Manually confirm payment
     */
    public function adminConfirmPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'action' => 'required|in:confirm,cancel',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $payment = Payment::findOrFail($id);
            
            if ($validated['action'] === 'confirm') {
                if ($payment->status !== 'pending') {
                    return back()->withErrors([
                        'general' => 'Apenas pagamentos pendentes podem ser confirmados.'
                    ]);
                }

                $payment->markAsPaid([
                    'manually_confirmed' => true,
                    'confirmed_by' => auth()->id(),
                    'admin_notes' => $validated['notes'],
                ]);
                
                $this->sendPaymentConfirmation($payment);
                
                $message = 'Pagamento confirmado com sucesso!';
                
            } else { // cancel
                $payment->markAsFailed([
                    'manually_cancelled' => true,
                    'cancelled_by' => auth()->id(),
                    'admin_notes' => $validated['notes'],
                ]);
                
                $message = 'Pagamento cancelado.';
            }

            Log::info('Payment manually processed by admin', [
                'payment_id' => $payment->payment_id,
                'action' => $validated['action'],
                'admin_id' => auth()->id(),
            ]);

            return back()->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Admin payment confirmation failed', [
                'error' => $e->getMessage(),
                'payment_id' => $id,
                'admin_id' => auth()->id(),
            ]);

            return back()->withErrors([
                'general' => 'Erro ao processar pagamento: ' . $e->getMessage()
            ]);
        }
    }
}