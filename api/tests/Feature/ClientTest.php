<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = Tenant::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test',
            'email' => 'test@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }

    public function test_list_clients(): void
    {
        Client::create(['tenant_id' => $this->user->tenant_id, 'name' => 'Cliente 1']);
        $response = $this->actingAs($this->user)->getJson('/api/clients');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data.data');
    }

    public function test_create_client(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/clients', [
            'name' => 'Nuevo Cliente',
            'phone' => '+5491155556666',
            'source' => 'whatsapp',
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('clients', ['name' => 'Nuevo Cliente']);
    }

    public function test_update_client_status(): void
    {
        $client = Client::create(['tenant_id' => $this->user->tenant_id, 'name' => 'Cliente']);
        $response = $this->actingAs($this->user)->patchJson("/api/clients/{$client->id}/status", [
            'status' => 'contactado',
        ]);
        $response->assertStatus(200);
        $this->assertEquals('contactado', $client->fresh()->status);
    }

    public function test_cannot_see_other_tenant_clients(): void
    {
        $otherTenant = Tenant::create(['name' => 'Other', 'slug' => 'other']);
        Client::create(['tenant_id' => $otherTenant->id, 'name' => 'Hidden']);

        $response = $this->actingAs($this->user)->getJson('/api/clients');
        $response->assertJsonCount(0, 'data.data');
    }
}
