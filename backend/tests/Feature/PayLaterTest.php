<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\PayLaterBill;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayLaterTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->account = Account::create([
            'user_id' => $this->user->id,
            'name' => 'BCA',
            'balance' => 500000,
        ]);
    }

    public function test_user_can_create_paylater_bill(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/paylater', [
            'provider_name' => 'Atome Finance',
            'description' => 'Sepatu Kuliah',
            'total_amount' => 150000,
            'due_date' => Carbon::today()->addDays(10)->toDateString(),
            'installment_info' => 'Cicilan 1 dari 3',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'provider_name' => 'Atome Finance',
                    'total_amount' => 150000,
                    'paid_amount' => 0,
                    'status' => 'pending',
                ],
            ]);

        $this->assertDatabaseHas('pay_later_bills', [
            'user_id' => $this->user->id,
            'provider_name' => 'Atome Finance',
            'total_amount' => 150000,
        ]);
    }

    public function test_user_can_record_repayment(): void
    {
        $bill = PayLaterBill::create([
            'user_id' => $this->user->id,
            'provider_name' => 'TikTok Shop PayLater',
            'total_amount' => 300000,
            'paid_amount' => 0,
            'due_date' => Carbon::today()->addDays(5)->toDateString(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/v1/paylater/{$bill->id}/repayments", [
            'amount' => 100000,
            'account_id' => $this->account->id,
            'notes' => 'Cicilan pertama',
        ]);

        $response->assertStatus(201);
        $this->assertEquals(100000, $bill->fresh()->paid_amount);
        $this->assertEquals('partially_paid', $bill->fresh()->status);
        $this->assertEquals(200000, $bill->fresh()->outstanding_amount);

        // Account balance was 500000 - 100000 = 400000
        $this->assertEquals(400000, $this->account->fresh()->balance);
    }

    public function test_repayment_cannot_exceed_outstanding_debt(): void
    {
        $bill = PayLaterBill::create([
            'user_id' => $this->user->id,
            'provider_name' => 'TikTok Shop PayLater',
            'total_amount' => 200000,
            'paid_amount' => 50000,
            'due_date' => Carbon::today()->addDays(5)->toDateString(),
            'status' => 'partially_paid',
        ]);

        // Outstanding is 150000, try to pay 200000
        $response = $this->actingAs($this->user)->postJson("/api/v1/paylater/{$bill->id}/repayments", [
            'amount' => 200000,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_quick_toggle_paid_marks_obligation_as_fully_paid(): void
    {
        $bill = PayLaterBill::create([
            'user_id' => $this->user->id,
            'provider_name' => 'Atome Finance',
            'total_amount' => 150000,
            'paid_amount' => 0,
            'due_date' => Carbon::today()->addDays(7)->toDateString(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/v1/paylater/{$bill->id}/toggle-paid");
        $response->assertStatus(200);

        $this->assertEquals(150000, $bill->fresh()->paid_amount);
        $this->assertEquals('paid', $bill->fresh()->status);
    }
}
