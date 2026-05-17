<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('tenant_id', auth()->user()->tenant_id)->get();
        return response()->json(['data' => $users]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'nullable|in:admin,user',
        ]);

        $user = User::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
        ]);

        return response()->json(['data' => $user], 201);
    }

    public function destroy(User $user)
    {
        if ($user->tenant_id !== auth()->user()->tenant_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'No podes eliminarte a vos mismo'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
