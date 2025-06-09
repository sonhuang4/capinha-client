<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'profile_picture',
        'logo',
        'whatsapp',
        'instagram',
        'website',
        'color_theme',
        'status',
        'code',
        'click_count',
    ];
}