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
            // Check if the foreign key exists and drop it
            try {
                // Drop the foreign key constraint if it exists
                $table->dropForeign(['request_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist, that's OK
            }
            
            // Remove the request_id column completely since we don't use card_requests
            if (Schema::hasColumn('cards', 'request_id')) {
                $table->dropColumn('request_id');
            }
            
            // Also remove other order-related columns that reference card_requests
            if (Schema::hasColumn('cards', 'order_id')) {
                $table->dropColumn('order_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            // Add the columns back if needed
            $table->unsignedBigInteger('request_id')->nullable()->after('id');
            $table->string('order_id')->nullable()->after('request_id');
        });
    }
};