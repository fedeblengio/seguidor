<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_tenant_and_user(): void
    {
        $response = $this->postJson('/api/register', [
            'business_name' => 'Mi Negocio',
            'name' => 'Juan',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tenants', ['name' => 'Mi Negocio']);
        $this->assertDatabaseHas('users', ['email' => 'juan@test.com', 'role' => 'admin']);
    }

    public function test_login_returns_user(): void
    {
        $this->postJson('/api/register', [
            'business_name' => 'Mi Negocio',
            'name' => 'Juan',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'juan@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['user' => ['id', 'name', 'email']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->postJson('/api/register', [
            'business_name' => 'Mi Negocio',
            'name' => 'Juan',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'juan@test.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
    }
}
