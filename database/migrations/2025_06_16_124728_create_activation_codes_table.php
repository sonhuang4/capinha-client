<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActivationCodesTable extends Migration
{
    public function up()
    {
        Schema::create('activation_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('status', ['available', 'sold', 'activated'])->default('available');
            $table->string('plan')->nullable(); // basic, premium, business
            $table->decimal('amount', 8, 2)->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('payment_method')->nullable(); // pix, credit
            $table->string('payment_id')->nullable(); // External payment ID
            $table->timestamp('sold_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('activation_codes');
    }
}