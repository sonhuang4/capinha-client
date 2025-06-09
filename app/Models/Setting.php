<?php

// app/Models/Setting.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'platform_name', 'admin_email', 'base_url',
        'email_notifications', 'card_alerts', 'analytics_reports',
        'two_factor', 'auto_logout',
        'theme', 'dark_mode',
    ];
}
