<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModeHematTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_get_mode_hemat_status(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/v1/mode-hemat');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_active' => false,
                ],
            ]);
    }

    public function test_user_can_activate_and_deactivate_self_lock(): void
    {
        // Activate
        $response = $this->actingAs($this->user)->postJson('/api/v1/mode-hemat/activate');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_active' => true,
                ],
            ]);

        $this->assertDatabaseHas('self_lock_settings', [
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);

        // Deactivate
        $responseDeact = $this->actingAs($this->user)->postJson('/api/v1/mode-hemat/deactivate');
        $responseDeact->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_active' => false,
                ],
            ]);

        $this->assertDatabaseHas('self_lock_settings', [
            'user_id' => $this->user->id,
            'is_active' => false,
        ]);
    }
}
