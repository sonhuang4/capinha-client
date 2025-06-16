<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            $table->string('code')->unique()->after('id');
            $table->enum('status', ['available', 'pending', 'sold', 'expired'])->default('available')->after('code');
            $table->string('plan')->nullable()->after('status');
            $table->decimal('amount', 8, 2)->nullable()->after('plan');
            $table->string('customer_name')->nullable()->after('amount');
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->string('customer_phone')->nullable()->after('customer_email');
            $table->string('payment_method')->nullable()->after('customer_phone');
            $table->string('payment_id')->nullable()->after('payment_method');
            $table->timestamp('sold_at')->nullable()->after('payment_id');
        });
    }

    public function down()
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            $table->dropColumn([
                'code',
                'status', 
                'plan',
                'amount',
                'customer_name',
                'customer_email',
                'customer_phone',
                'payment_method',
                'payment_id',
                'sold_at'
            ]);
        });
    }
};