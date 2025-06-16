<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivationCode;

class ActivationCodeSeeder extends Seeder
{
    public function run()
    {
        // Generate 100 initial activation codes
        for ($i = 0; $i < 100; $i++) {
            ActivationCode::create([
                'code' => ActivationCode::generateCode(),
                'status' => 'available'
            ]);
        }
    }
}