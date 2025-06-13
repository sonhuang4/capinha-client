<?php

namespace App\Http\Controllers;

use App\Models\CardRequest;
use Inertia\Inertia;

class CardRequestController extends Controller
{
    public function index()
    {
        $requests = \App\Models\CardRequest::select('id', 'name', 'email', 'whatsapp', 'status', 'created_at')
            ->where('status', 'pending') 
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('AdminRequests', [
            'requests' => $requests
        ]);
    }
}