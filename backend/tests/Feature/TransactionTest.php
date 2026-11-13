<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->account = Account::create([
            'user_id' => $this->user->id,
            'name' => 'BCA',
            'account_type' => 'bank',
            'balance' => 1000000,
        ]);

        $this->category = Category::create([
            'name' => 'Warteg',
            'slug' => 'groceries',
            'type' => 'expense',
            'is_system' => true,
        ]);
    }

    public function test_user_can_create_expense_transaction_and_balance_deducts(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/transactions', [
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 25000,
            'description' => 'Makan Siang Warteg',
            'transaction_date' => '2026-11-13',
            'payment_method' => 'QRIS',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'amount' => 25000,
                    'type' => 'expense',
                    'description' => 'Makan Siang Warteg',
                ],
            ]);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'amount' => 25000,
            'type' => 'expense',
        ]);

        // Balance was 1000000 - 25000 = 975000
        $this->assertEquals(975000, $this->account->fresh()->balance);
    }

    public function test_user_can_create_income_transaction_and_balance_increases(): void
    {
        $incomeCat = Category::create([
            'name' => 'Uang Saku',
            'slug' => 'uang-saku',
            'type' => 'income',
            'is_system' => true,
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/v1/transactions', [
            'account_id' => $this->account->id,
            'category_id' => $incomeCat->id,
            'type' => 'income',
            'amount' => 500000,
            'description' => 'Transfer Ortu',
            'transaction_date' => '2026-11-01',
        ]);

        $response->assertStatus(201);
        // Balance was 1000000 + 500000 = 1500000
        $this->assertEquals(1500000, $this->account->fresh()->balance);
    }

    public function test_transaction_requires_positive_amount(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/transactions', [
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => -10000,
            'description' => 'Invalid',
            'transaction_date' => '2026-11-13',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_user_can_update_transaction_and_balances_adjust(): void
    {
        $transaction = Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 50000,
            'description' => 'Old description',
            'transaction_date' => '2026-11-10',
        ]);
        $this->account->balance -= 50000;
        $this->account->save();
        $this->assertEquals(950000, $this->account->balance);

        // Update amount from 50000 to 70000
        $response = $this->actingAs($this->user)->putJson("/api/v1/transactions/{$transaction->id}", [
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 70000,
            'description' => 'New description',
            'transaction_date' => '2026-11-10',
        ]);

        $response->assertStatus(200);
        $this->assertEquals(70000, $transaction->fresh()->amount);
        // 950000 + 50000 (revert) - 70000 (reapply) = 930000
        $this->assertEquals(930000, $this->account->fresh()->balance);
    }

    public function test_user_can_delete_transaction_and_balance_reverts(): void
    {
        $transaction = Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 40000,
            'description' => 'Makan',
            'transaction_date' => '2026-11-10',
        ]);
        $this->account->balance -= 40000;
        $this->account->save();

        $response = $this->actingAs($this->user)->deleteJson("/api/v1/transactions/{$transaction->id}");
        $response->assertStatus(200);

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
        $this->assertEquals(1000000, $this->account->fresh()->balance);
    }

    public function test_user_cannot_access_another_users_transaction(): void
    {
        $otherUser = User::factory()->create();
        $otherAccount = Account::create([
            'user_id' => $otherUser->id,
            'name' => 'Mandiri',
            'balance' => 500000,
        ]);

        $otherTransaction = Transaction::create([
            'user_id' => $otherUser->id,
            'account_id' => $otherAccount->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 30000,
            'description' => 'Secret transaction',
            'transaction_date' => '2026-11-12',
        ]);

        $response = $this->actingAs($this->user)->getJson("/api/v1/transactions/{$otherTransaction->id}");
        $response->assertStatus(403);

        $responseDel = $this->actingAs($this->user)->deleteJson("/api/v1/transactions/{$otherTransaction->id}");
        $responseDel->assertStatus(403);
    }
}
