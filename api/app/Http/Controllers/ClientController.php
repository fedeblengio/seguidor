<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json(['data' => $query->latest()->paginate(20)]);
    }

    public function store(StoreClientRequest $request)
    {
        $client = Client::create($request->validated());
        return response()->json(['data' => $client], 201);
    }

    public function show(Client $client)
    {
        return response()->json(['data' => $client->load(['notes.user', 'reminders'])]);
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        $client->update($request->validated());
        return response()->json(['data' => $client]);
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(['message' => 'Cliente eliminado']);
    }

    public function updateStatus(Request $request, Client $client)
    {
        $request->validate([
            'status' => 'required|in:nuevo,contactado,presupuesto_enviado,seguimiento_pendiente,vendido,perdido',
        ]);

        $client->update(['status' => $request->status]);
        return response()->json(['data' => $client]);
    }
}
