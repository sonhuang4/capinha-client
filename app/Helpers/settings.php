<?php

// Create file: app/Helpers/settings.php

if (!function_exists('setting')) {
    /**
     * Get or set platform settings
     */
    function setting($key = null, $default = null)
    {
        if ($key === null) {
            // Return all settings
            return \App\Http\Controllers\SettingsController::get('all');
        }
        
        // Return specific setting
        return \App\Http\Controllers\SettingsController::get($key, $default);
    }
}

if (!function_exists('set_setting')) {
    /**
     * Set a platform setting
     */
    function set_setting($key, $value)
    {
        return \App\Http\Controllers\SettingsController::set($key, $value);
    }
}

if (!function_exists('platform_name')) {
    /**
     * Get platform name
     */
    function platform_name()
    {
        return setting('platform_name', config('app.name'));
    }
}

if (!function_exists('admin_email')) {
    /**
     * Get admin email
     */
    function admin_email()
    {
        return setting('admin_email', config('mail.from.address'));
    }
}

if (!function_exists('base_url')) {
    /**
     * Get base URL
     */
    function base_url()
    {
        return setting('base_url', config('app.url'));
    }
}