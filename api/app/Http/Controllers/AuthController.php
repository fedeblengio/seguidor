<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = DB::transaction(function () use ($request) {
            $tenant = Tenant::create([
                'name' => $request->business_name,
                'slug' => Str::slug($request->business_name) . '-' . Str::random(4),
            ]);

            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'admin',
            ]);

            return compact('tenant', 'user');
        });

        auth()->login($data['user']);

        return response()->json(['user' => $data['user']], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        auth()->login($user);

        return response()->json(['user' => $user]);
    }

    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Sesion cerrada']);
    }

    public function me()
    {
        return response()->json(['user' => auth()->user()->load('tenant')]);
    }
}
