<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Reminder;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $statuses = ['nuevo', 'contactado', 'presupuesto_enviado', 'seguimiento_pendiente', 'vendido', 'perdido'];
        $counts = [];

        foreach ($statuses as $status) {
            $counts[$status] = Client::where('status', $status)->count();
        }

        $counts['reminders_pending'] = Reminder::where('user_id', auth()->id())
            ->where('completed', false)
            ->where('due_at', '<=', now())
            ->count();

        return response()->json($counts);
    }
}
