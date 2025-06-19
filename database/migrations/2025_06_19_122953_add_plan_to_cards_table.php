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
            // Add plan column to track which plan the card belongs to
            $table->enum('plan', ['basic', 'premium', 'business'])
                  ->default('basic')
                  ->after('color_theme');
            
            // Add payment tracking
            $table->foreignId('payment_id')->nullable()->after('plan')->constrained()->onDelete('set null');
            
            // Add created date for better tracking
            $table->timestamp('activated_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn(['plan', 'payment_id', 'activated_at']);
        });
    }
};