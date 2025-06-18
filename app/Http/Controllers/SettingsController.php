<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Get current settings
     */
    public function index()
    {
        $settings = $this->getSettings();
        
        // For web requests - return page
        if (request()->expectsJson()) {
            return response()->json($settings);
        }
        
        // For browser requests - return Inertia page
        return Inertia::render('AdminSettings', [
            'settings' => $settings
        ]);
    }

    /**
     * Save settings
     */
    public function save(Request $request)
    {
        $validated = $request->validate([
            'platform_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255',
            'base_url' => 'required|url|max:255',
            'email_notifications' => 'boolean',
            'card_alerts' => 'boolean',
            'analytics_reports' => 'boolean',
            'two_factor' => 'boolean',
            'auto_logout' => 'boolean',
            'theme' => 'required|in:blue,purple,green,pink,orange',
            'dark_mode' => 'boolean'
        ]);

        try {
            // Save to JSON file
            $settingsPath = storage_path('app/settings.json');
            file_put_contents($settingsPath, json_encode($validated, JSON_PRETTY_PRINT));
            
            // Clear cache
            Cache::forget('platform_settings');
            
            Log::info('Settings updated successfully', ['admin' => auth()->user()->email ?? 'system']);
            
            return response()->json([
                'success' => true,
                'message' => 'Configurações salvas com sucesso!'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to save settings', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao salvar configurações: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset settings to defaults
     */
    public function reset()
    {
        try {
            $defaults = $this->getDefaultSettings();
            
            // Save defaults to file
            $settingsPath = storage_path('app/settings.json');
            file_put_contents($settingsPath, json_encode($defaults, JSON_PRETTY_PRINT));
            
            // Clear cache
            Cache::forget('platform_settings');
            
            Log::info('Settings reset to defaults', ['admin' => auth()->user()->email ?? 'system']);
            
            return response()->json($defaults);
            
        } catch (\Exception $e) {
            Log::error('Failed to reset settings', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao restaurar configurações'
            ], 500);
        }
    }

    /**
     * Get settings from cache or file
     */
    private function getSettings()
    {
        return Cache::remember('platform_settings', 3600, function () {
            $settingsPath = storage_path('app/settings.json');
            
            if (file_exists($settingsPath)) {
                $settings = json_decode(file_get_contents($settingsPath), true);
                
                // Merge with defaults to ensure all keys exist
                return array_merge($this->getDefaultSettings(), $settings);
            }
            
            return $this->getDefaultSettings();
        });
    }

    /**
     * Default settings
     */
    private function getDefaultSettings()
    {
        return [
            'platform_name' => config('app.name', 'Capinha Digital'),
            'admin_email' => config('mail.from.address', 'walivros@gmail.com'),
            'base_url' => config('app.url', 'http://localhost:8000'),
            'email_notifications' => true,
            'card_alerts' => false,
            'analytics_reports' => true,
            'two_factor' => false,
            'auto_logout' => true,
            'theme' => 'blue',
            'dark_mode' => true
        ];
    }

    /**
     * Get specific setting value
     */
    public static function get($key, $default = null)
    {
        $settings = Cache::get('platform_settings');
        
        if (!$settings) {
            $controller = new self();
            $settings = $controller->getSettings();
        }
        
        return $settings[$key] ?? $default;
    }

    /**
     * Update specific setting
     */
    public static function set($key, $value)
    {
        $controller = new self();
        $settings = $controller->getSettings();
        $settings[$key] = $value;
        
        $settingsPath = storage_path('app/settings.json');
        file_put_contents($settingsPath, json_encode($settings, JSON_PRETTY_PRINT));
        
        Cache::forget('platform_settings');
        
        return true;
    }
}