<?php

namespace App\Http\Controllers;

use App\Models\ActivationCode;
use App\Models\Card;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ActivationCodeController extends Controller
{
    /**
     * Admin: Display activation codes dashboard
     */
    public function index()
    {
        $codes = ActivationCode::orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = $this->getActivationStats();

        return Inertia::render('Admin/ActivationCodes/Index', [
            'codes' => $codes->through(function ($code) {
                return [
                    'id' => $code->id,
                    'code' => $code->code,
                    'status' => $code->status,
                    'plan' => $code->plan,
                    'amount' => $code->amount,
                    'customer_name' => $code->customer_name,
                    'customer_email' => $code->customer_email,
                    'customer_phone' => $code->customer_phone,
                    'payment_method' => $code->payment_method,
                    'created_at' => $code->created_at->format('d/m/Y H:i'),
                    'sold_at' => $code->sold_at ? $code->sold_at->format('d/m/Y H:i') : null,
                    'activated_at' => $code->activated_at ? $code->activated_at->format('d/m/Y H:i') : null,
                    'time_ago' => $code->created_at->diffForHumans(),
                    'activation_link' => config('app.url') . '/activate/' . $code->code,
                    'has_card' => $code->card !== null,
                    'card_url' => $code->card ? config('app.url') . '/c/' . $code->card->code : null,
                ];
            }),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $codes->currentPage(),
                'last_page' => $codes->lastPage(),
                'per_page' => $codes->perPage(),
                'total' => $codes->total(),
            ]
        ]);
    }

    /**
     * Admin: Create activation code for manual sale
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'plan' => 'nullable|in:basic,premium,business',
            'amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'quantity' => 'nullable|integer|min:1|max:100',
        ]);

        $quantity = $validated['quantity'] ?? 1;
        $codes = [];

        try {
            DB::beginTransaction();

            for ($i = 0; $i < $quantity; $i++) {
                $code = ActivationCode::create([
                    'code' => ActivationCode::generateCode(),
                    'status' => 'sold',
                    'plan' => $validated['plan'] ?? 'basic',
                    'amount' => $validated['amount'],
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'],
                    'payment_method' => $validated['payment_method'] ?? 'manual',
                    'sold_at' => now(),
                ]);

                $codes[] = $code;
            }

            DB::commit();

            Log::info('Activation codes created by admin', [
                'admin_id' => auth()->id(),
                'admin_email' => auth()->user()->email,
                'quantity' => $quantity,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'codes' => collect($codes)->pluck('code')->toArray(),
            ]);

            $message = $quantity === 1 
                ? "Código de ativação criado: {$codes[0]->code}"
                : "{$quantity} códigos de ativação criados com sucesso";

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create activation codes', [
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
                'request_data' => $validated,
            ]);

            return redirect()->back()->withErrors([
                'general' => 'Erro ao criar código(s): ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Client: Show activation page
     */
    public function show($code)
    {
        // Clean the code and validate format
        $cleanCode = strtoupper(trim($code));
        
        // Find the activation code
        $activationCode = ActivationCode::where('code', $cleanCode)
            ->whereIn('status', ['sold', 'pending'])
            ->first();

        if (!$activationCode) {
            return Inertia::render('Client/ActivationNotFound', [
                'message' => 'Código de ativação inválido ou já utilizado.',
                'code' => $cleanCode
            ]);
        }

        return Inertia::render('Client/ActivateCard', [
            'activation_code' => $activationCode->code,
            'customer_data' => [
                'name' => $activationCode->customer_name,
                'email' => $activationCode->customer_email,
                'phone' => $activationCode->customer_phone,
            ],
            'plan' => $activationCode->plan,
            'amount' => $activationCode->amount,
            'payment_method' => $activationCode->payment_method,
        ]);
    }

    /**
     * Client: Process activation (redirect to card creation)
     */
    public function activate(Request $request, $code)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'accept_terms' => 'required|accepted',
        ]);

        try {
            DB::beginTransaction();

            // Find and validate the activation code
            $activationCode = ActivationCode::where('code', $code)
                ->whereIn('status', ['sold', 'pending'])
                ->first();

            if (!$activationCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Código de ativação inválido ou já utilizado.'
                ], 400);
            }

            // Create or find user
            $user = User::where('email', $validated['email'])->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => bcrypt(Str::random(12)), // Random password
                    'email_verified_at' => now(),
                    'role' => 'client',
                ]);
            }

            // Log in the user
            auth()->login($user);

            // Store customer data and activation code in session for card creation
            session([
                'customer_data' => [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                ],
                'activation_code' => $code,
                'activation_plan' => $activationCode->plan,
            ]);

            // Mark activation code as activated
            $activationCode->update([
                'status' => 'activated',
                'activated_at' => now(),
            ]);

            DB::commit();

            Log::info('Activation code activated', [
                'code' => $code,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'customer_name' => $validated['name'],
                'plan' => $activationCode->plan,
            ]);

            // Redirect to card creation
            return response()->json([
                'success' => true,
                'redirect_url' => route('card.create'),
                'message' => 'Código ativado com sucesso! Agora crie seu cartão.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Activation failed', [
                'code' => $code,
                'error' => $e->getMessage(),
                'user_data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro durante a ativação: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Bulk generate codes for inventory
     */
    public function bulkGenerate(Request $request)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:1000',
            'plan' => 'nullable|in:basic,premium,business',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $codes = [];
            $quantity = $validated['quantity'];

            for ($i = 0; $i < $quantity; $i++) {
                $codes[] = [
                    'code' => ActivationCode::generateCode(),
                    'status' => 'available',
                    'plan' => $validated['plan'] ?? 'basic',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            ActivationCode::insert($codes);
            DB::commit();

            Log::info('Bulk activation codes generated', [
                'admin_id' => auth()->id(),
                'quantity' => $quantity,
                'plan' => $validated['plan'] ?? 'basic',
            ]);

            return redirect()->back()->with('success', 
                "{$quantity} códigos de ativação gerados com sucesso!"
            );

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Bulk generation failed', [
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
                'quantity' => $validated['quantity'],
            ]);

            return redirect()->back()->withErrors([
                'general' => 'Erro ao gerar códigos: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Admin: Update activation code
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'plan' => 'nullable|in:basic,premium,business',
            'amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:100',
            'status' => 'nullable|in:available,sold,activated,expired',
        ]);

        try {
            $activationCode = ActivationCode::findOrFail($id);

            $updateData = [
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'plan' => $validated['plan'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
            ];

            if (isset($validated['status'])) {
                $updateData['status'] = $validated['status'];
                
                // Set timestamps based on status
                if ($validated['status'] === 'sold' && !$activationCode->sold_at) {
                    $updateData['sold_at'] = now();
                } elseif ($validated['status'] === 'activated' && !$activationCode->activated_at) {
                    $updateData['activated_at'] = now();
                }
            }

            $activationCode->update($updateData);

            return redirect()->back()->with('success', 'Código atualizado com sucesso!');

        } catch (\Exception $e) {
            Log::error('Failed to update activation code', [
                'code_id' => $id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
            ]);

            return redirect()->back()->withErrors([
                'general' => 'Erro ao atualizar código: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Admin: Delete activation code
     */
    public function destroy($id)
    {
        try {
            $activationCode = ActivationCode::findOrFail($id);

            // Don't allow deletion of activated codes
            if ($activationCode->status === 'activated') {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível deletar códigos já ativados.'
                ], 400);
            }

            $codeInfo = [
                'code' => $activationCode->code,
                'status' => $activationCode->status,
                'customer_name' => $activationCode->customer_name,
            ];

            $activationCode->delete();

            Log::info('Activation code deleted', [
                'admin_id' => auth()->id(),
                'deleted_code' => $codeInfo,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Código deletado com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete activation code', [
                'code_id' => $id,
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao deletar código: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export activation codes to CSV
     */
    public function export(Request $request)
    {
        $status = $request->get('status', 'all');
        
        $query = ActivationCode::query();
        
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $codes = $query->orderBy('created_at', 'desc')->get();

        $filename = 'activation_codes_' . $status . '_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($codes) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'Código', 'Status', 'Plano', 'Cliente', 'Email', 'Telefone', 'Valor',
                'Método Pagamento', 'Data Criação', 'Data Venda', 'Data Ativação'
            ]);

            foreach ($codes as $code) {
                fputcsv($file, [
                    $code->code,
                    $code->status,
                    $code->plan,
                    $code->customer_name,
                    $code->customer_email,
                    $code->customer_phone,
                    $code->amount ? 'R$ ' . number_format($code->amount, 2, ',', '.') : '',
                    $code->payment_method,
                    $code->created_at->format('d/m/Y H:i'),
                    $code->sold_at ? $code->sold_at->format('d/m/Y H:i') : '',
                    $code->activated_at ? $code->activated_at->format('d/m/Y H:i') : '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * Get activation statistics for dashboard
     */
    private function getActivationStats()
    {
        $total = ActivationCode::count();
        $available = ActivationCode::where('status', 'available')->count();
        $sold = ActivationCode::where('status', 'sold')->count();
        $activated = ActivationCode::where('status', 'activated')->count();
        $expired = ActivationCode::where('status', 'expired')->count();

        $totalRevenue = ActivationCode::whereNotNull('amount')->sum('amount');
        $activationRate = $sold > 0 ? round(($activated / $sold) * 100, 1) : 0;

        return [
            'total_codes' => $total,
            'available' => $available,
            'sold' => $sold,
            'activated' => $activated,
            'expired' => $expired,
            'pending_activation' => $sold - $activated,
            'total_revenue' => $totalRevenue,
            'activation_rate' => $activationRate,
            'codes_today' => ActivationCode::whereDate('created_at', today())->count(),
            'activations_today' => ActivationCode::whereDate('activated_at', today())->count(),
        ];
    }
}