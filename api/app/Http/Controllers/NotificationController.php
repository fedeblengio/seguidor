<?php

namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Notification::where('user_id', auth()->id())
                ->where('read', false)
                ->latest()
                ->limit(20)
                ->get()
        ]);
    }

    public function markRead()
    {
        Notification::where('user_id', auth()->id())->update(['read' => true]);
        return response()->json(['message' => 'ok']);
    }
}
