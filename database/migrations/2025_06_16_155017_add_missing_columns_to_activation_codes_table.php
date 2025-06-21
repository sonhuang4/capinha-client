<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            // All of these are already present — so now remove everything.
            // This migration is now redundant unless you're adding *new* fields.
        });
    }

    public function down()
    {
        Schema::table('activation_codes', function (Blueprint $table) {
            // All fields already defined elsewhere — so remove nothing.
        });
    }
};
