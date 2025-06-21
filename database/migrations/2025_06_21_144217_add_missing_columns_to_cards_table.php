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
            // Add the plan column that's causing the error
            if (!Schema::hasColumn('cards', 'plan')) {
                $table->string('plan')->nullable()->after('status');
            }
            
            // Add payment_id column for linking to payments
            if (!Schema::hasColumn('cards', 'payment_id')) {
                $table->unsignedBigInteger('payment_id')->nullable()->after('plan');
            }
            
            // Add other columns that might be missing based on your controller
            if (!Schema::hasColumn('cards', 'activation_code')) {
                $table->string('activation_code')->nullable()->after('payment_id');
            }
            
            if (!Schema::hasColumn('cards', 'unique_slug')) {
                $table->string('unique_slug')->unique()->nullable()->after('code');
            }
            
            if (!Schema::hasColumn('cards', 'job_title')) {
                $table->string('job_title')->nullable()->after('name');
            }
            
            if (!Schema::hasColumn('cards', 'company')) {
                $table->string('company')->nullable()->after('job_title');
            }
            
            if (!Schema::hasColumn('cards', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            
            if (!Schema::hasColumn('cards', 'location')) {
                $table->string('location')->nullable()->after('company');
            }
            
            if (!Schema::hasColumn('cards', 'bio')) {
                $table->text('bio')->nullable()->after('location');
            }
            
            if (!Schema::hasColumn('cards', 'linkedin')) {
                $table->string('linkedin')->nullable()->after('instagram');
            }
            
            if (!Schema::hasColumn('cards', 'twitter')) {
                $table->string('twitter')->nullable()->after('linkedin');
            }
            
            if (!Schema::hasColumn('cards', 'facebook')) {
                $table->string('facebook')->nullable()->after('twitter');
            }
            
            // Add indexes for better performance
            $table->index('plan');
            $table->index('payment_id');
            $table->index('activation_code');
            $table->index('unique_slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn([
                'plan',
                'payment_id', 
                'activation_code',
                'unique_slug',
                'job_title',
                'company',
                'phone',
                'location',
                'bio',
                'linkedin',
                'twitter',
                'facebook'
            ]);
        });
    }
};