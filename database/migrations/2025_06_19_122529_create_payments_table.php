<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            
            // User who made the payment
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Payment details
            $table->string('payment_id')->unique(); // External payment ID
            $table->enum('status', ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'])
                  ->default('pending')
                  ->index();
            
            // Plan and pricing
            $table->enum('plan', ['basic', 'premium', 'business'])->default('basic');
            $table->decimal('amount', 10, 2); // R$ 39.90
            $table->string('currency', 3)->default('BRL');
            
            // Payment method
            $table->enum('payment_method', ['pix', 'credit_card', 'boleto', 'debit_card'])
                  ->index();
            
            // Customer information
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->string('customer_document')->nullable(); // CPF
            
            // Payment gateway data
            $table->string('gateway')->default('mercadopago'); // mercadopago, pagseguro, stripe
            $table->string('gateway_payment_id')->nullable(); // Gateway's payment ID
            $table->json('gateway_response')->nullable(); // Full gateway response
            
            // PIX specific data
            $table->text('pix_code')->nullable(); // PIX payment code
            $table->string('pix_qr_code')->nullable(); // QR code URL
            $table->timestamp('pix_expires_at')->nullable();
            
            // Card creation tracking
            $table->foreignId('card_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('card_created_at')->nullable();
            
            // Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['status', 'created_at']);
            $table->index(['payment_method', 'status']);
            $table->index(['gateway', 'gateway_payment_id']);
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};