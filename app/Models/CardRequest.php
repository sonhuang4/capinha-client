<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardRequest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'whatsapp',
        'instagram',
        'website',
        'profile_picture',
        'logo',
        'color_theme',
        'status',
    ];
}