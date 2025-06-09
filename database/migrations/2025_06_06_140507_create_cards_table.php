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
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Card identification
            $table->string('code', 20)->unique(); // e.g., "123456"
            $table->enum('status', ['pending', 'active', 'blocked'])->default('pending');
            
            // Personal info
            $table->string('name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('job_title')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            
            // Social links
            $table->text('whatsapp')->nullable();
            $table->text('instagram')->nullable(); 
            $table->text('linkedin')->nullable();
            $table->text('website')->nullable();
            $table->text('facebook')->nullable();
            
            // Media
            $table->text('photo_url')->nullable();
            $table->text('logo_url')->nullable();
            
            // Additional info
            $table->text('bio')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};
