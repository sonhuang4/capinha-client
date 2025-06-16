<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddActivationCodeToCardsTable extends Migration
{
    public function up()
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->string('activation_code')->nullable()->after('id');
            $table->string('code')->unique()->after('id');
            $table->string('unique_slug')->unique()->nullable()->after('activation_code');
            $table->integer('click_count')->default(0)->after('status');
            $table->json('analytics_data')->nullable()->after('click_count');
        });
    }

    public function down()
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn(['activation_code', 'code', 'unique_slug', 'click_count', 'analytics_data']);
        });
    }
}
