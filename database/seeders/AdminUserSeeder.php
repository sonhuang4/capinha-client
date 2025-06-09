<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\App;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@capinhadigital.com');
        $adminPassword = env('ADMIN_PASSWORD', 'admin123');

        $admin = User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Admin',
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // Only echo in non-production environments
        if (!App::environment('production')) {
            echo " Admin user created or updated successfully!\n";
            echo " Email: {$adminEmail}\n";
            echo " Password: {$adminPassword}\n";
        }
    }
}
