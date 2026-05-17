<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function index()
    {
        $reminders = Reminder::where('user_id', auth()->id())
            ->where('completed', false)
            ->with('client:id,name')
            ->orderBy('due_at')
            ->get();

        return response()->json(['data' => $reminders]);
    }

    public function store(Request $request, Client $client)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'due_at' => 'required|date',
        ]);

        $reminder = Reminder::create([
            'client_id' => $client->id,
            'user_id' => auth()->id(),
            'tenant_id' => auth()->user()->tenant_id,
            'title' => $request->title,
            'due_at' => $request->due_at,
        ]);

        return response()->json(['data' => $reminder], 201);
    }

    public function update(Request $request, Reminder $reminder)
    {
        $request->validate(['completed' => 'required|boolean']);
        $reminder->update(['completed' => $request->completed]);
        return response()->json(['data' => $reminder]);
    }

    public function destroy(Reminder $reminder)
    {
        $reminder->delete();
        return response()->json(['message' => 'Recordatorio eliminado']);
    }
}
