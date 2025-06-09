<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    public function get()
    {
        $settings = Setting::first();

        return Inertia::render('AdminSettings', [
            'settings' => $settings,
        ]);
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'platform_name' => 'required|string|max:255',
            'admin_email' => 'nullable|email',
            'base_url' => 'nullable|url',
            'email_notifications' => 'boolean',
            'card_alerts' => 'boolean',
            'analytics_reports' => 'boolean',
            'two_factor' => 'boolean',
            'auto_logout' => 'boolean',
            'theme' => 'string',
            'dark_mode' => 'boolean',
        ]);

        $settings = Setting::first();
        if (!$settings) {
            $settings = Setting::create($validated);
        } else {
            $settings->update($validated);
        }

        return response()->json(['message' => 'Settings updated']);
    }

    public function reset()
    {
        $defaults = [
            'platform_name' => 'Digital Business Cards',
            'admin_email' => 'admin@example.com',
            'base_url' => 'https://yourapp.com',
            'email_notifications' => false,
            'card_alerts' => false,
            'analytics_reports' => false,
            'two_factor' => false,
            'auto_logout' => true,
            'theme' => 'blue',
            'dark_mode' => true,
        ];

        $settings = Setting::first();
        if ($settings) {
            $settings->update($defaults);
        } else {
            $settings = Setting::create($defaults);
        }

        return response()->json($settings);
    }
}
