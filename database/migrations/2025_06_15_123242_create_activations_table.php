<?php
// Create this migration file: database/migrations/xxxx_create_activations_table.php
// Run: php artisan make:migration create_activations_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('card_id')->constrained('cards')->onDelete('cascade');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('location')->nullable(); // Optional: city, country
            $table->string('device_type')->nullable(); // mobile, desktop, tablet
            $table->string('referrer')->nullable(); // where they came from
            $table->timestamps();
            
            $table->index(['card_id', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activations');
    }
};