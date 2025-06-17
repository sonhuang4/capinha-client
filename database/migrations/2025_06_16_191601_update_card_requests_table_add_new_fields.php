<?php
// Create this migration: php artisan make:migration update_card_requests_table_add_new_fields

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('card_requests', function (Blueprint $table) {
            // Basic Information (if not exists)
            if (!Schema::hasColumn('card_requests', 'job_title')) {
                $table->string('job_title')->nullable()->after('name');
            }
            if (!Schema::hasColumn('card_requests', 'company')) {
                $table->string('company')->nullable()->after('job_title');
            }
            if (!Schema::hasColumn('card_requests', 'bio')) {
                $table->text('bio')->nullable()->after('company');
            }
            
            // Contact Information (if not exists)
            if (!Schema::hasColumn('card_requests', 'phone')) {
                $table->string('phone', 20)->nullable()->after('email');
            }
            if (!Schema::hasColumn('card_requests', 'location')) {
                $table->string('location')->nullable()->after('website');
            }
            
            // Social Media (if not exists)
            if (!Schema::hasColumn('card_requests', 'linkedin')) {
                $table->string('linkedin')->nullable()->after('instagram');
            }
            if (!Schema::hasColumn('card_requests', 'twitter')) {
                $table->string('twitter')->nullable()->after('linkedin');
            }
            if (!Schema::hasColumn('card_requests', 'facebook')) {
                $table->string('facebook')->nullable()->after('twitter');
            }
            
            // System Fields (if not exists)
            if (!Schema::hasColumn('card_requests', 'activation_code')) {
                $table->string('activation_code', 50)->nullable()->after('color_theme');
            }
            if (!Schema::hasColumn('card_requests', 'notes')) {
                $table->text('notes')->nullable()->after('activation_code');
            }
            if (!Schema::hasColumn('card_requests', 'processed_at')) {
                $table->timestamp('processed_at')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('card_requests', 'processed_by')) {
                $table->foreignId('processed_by')->nullable()->constrained('users')->after('processed_at');
            }
            
            // Add indexes for better performance
            $table->index(['status', 'created_at']);
            $table->index('processed_at');
        });
    }

    public function down(): void
    {
        Schema::table('card_requests', function (Blueprint $table) {
            $table->dropColumn([
                'job_title', 'company', 'bio', 'phone', 'location',
                'linkedin', 'twitter', 'facebook', 'activation_code',
                'notes', 'processed_at', 'processed_by'
            ]);
            
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['processed_at']);
        });
    }
};