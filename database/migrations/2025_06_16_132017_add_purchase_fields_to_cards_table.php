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
            // Purchase system fields
            $table->string('activation_code')->nullable()->after('id');
            $table->string('unique_slug')->unique()->nullable()->after('activation_code');
            
            // Extended personal/professional info
            $table->string('job_title')->nullable()->after('name');
            $table->string('company')->nullable()->after('job_title');
            $table->string('phone')->nullable()->after('email');
            $table->string('location')->nullable()->after('website');
            $table->text('bio')->nullable()->after('location');
            
            // Additional social media
            $table->string('linkedin')->nullable()->after('instagram');
            $table->string('twitter')->nullable()->after('linkedin');
            $table->string('facebook')->nullable()->after('twitter');
            
            // Analytics and tracking
            $table->json('analytics_data')->nullable()->after('click_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn([
                'activation_code',
                'unique_slug', 
                'job_title',
                'company',
                'phone',
                'location',
                'bio',
                'linkedin',
                'twitter',
                'facebook',
                'analytics_data'
            ]);
        });
    }
};