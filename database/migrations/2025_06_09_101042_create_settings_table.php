<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('settings', function (Blueprint $table) {
        $table->id();
        $table->string('platform_name')->default('Digital Business Cards');
        $table->string('admin_email')->nullable();
        $table->string('base_url')->nullable();

        $table->boolean('email_notifications')->default(false);
        $table->boolean('card_alerts')->default(false);
        $table->boolean('analytics_reports')->default(false);

        $table->boolean('two_factor')->default(false);
        $table->boolean('auto_logout')->default(true);

        $table->string('theme')->default('blue');
        $table->boolean('dark_mode')->default(true);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
