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
        Schema::table('cards', function (Blueprint $table) {
            // Add request relationship
            $table->unsignedBigInteger('request_id')->nullable()->after('id');
            
            // Add order tracking fields
            $table->string('order_id')->nullable()->after('request_id');
            $table->string('payment_status')->default('pending')->after('status'); // pending, paid, failed, refunded
            $table->string('payment_method')->nullable()->after('payment_status'); // pix, credit_card, boleto
            
            // Add date tracking
            $table->timestamp('purchase_date')->nullable()->after('payment_method');
            $table->timestamp('activation_date')->nullable()->after('purchase_date');
            $table->timestamp('expiry_date')->nullable()->after('activation_date');
            
            // Add customer notes
            $table->text('customer_notes')->nullable()->after('expiry_date');
            
            // Add foreign key constraint
            $table->foreign('request_id')->references('id')->on('card_requests')->onDelete('set null');
            
            // Add indexes for performance
            $table->index(['payment_status']);
            $table->index(['status']);
            $table->index(['created_at']);
            $table->index(['activation_date']);
            $table->index(['expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['request_id']);
            
            // Drop indexes
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['activation_date']);
            $table->dropIndex(['expiry_date']);
            
            // Drop columns
            $table->dropColumn([
                'request_id',
                'order_id',
                'payment_status',
                'payment_method',
                'purchase_date',
                'activation_date',
                'expiry_date',
                'customer_notes'
            ]);
        });
    }
};