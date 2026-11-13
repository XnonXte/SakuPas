<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\SelfLockSetting;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->category = Category::create([
            'name' => 'Kebutuhan Pokok',
            'slug' => 'groceries',
            'type' => 'expense',
            'is_system' => true,
        ]);
    }

    public function test_user_can_set_budget_allocation(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/v1/budgets', [
            'category_id' => $this->category->id,
            'amount' => 800000,
            'month' => Carbon::now()->month,
            'year' => Carbon::now()->year,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'amount' => 800000,
                ],
            ]);

        $this->assertDatabaseHas('budgets', [
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'amount' => 800000,
        ]);
    }

    public function test_monthly_budgets_calculates_actual_spending_from_transactions(): void
    {
        $now = Carbon::now();

        // 1. Set budget
        Budget::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'amount' => 500000,
            'month' => $now->month,
            'year' => $now->year,
        ]);

        // 2. Add transactions for this category
        $account = Account::create([
            'user_id' => $this->user->id,
            'name' => 'BCA',
            'balance' => 1000000,
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $account->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 150000,
            'description' => 'Makan',
            'transaction_date' => $now->toDateString(),
        ]);

        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $account->id,
            'category_id' => $this->category->id,
            'type' => 'expense',
            'amount' => 50000,
            'description' => 'Beras',
            'transaction_date' => $now->toDateString(),
        ]);

        // 3. Get budgets
        $response = $this->actingAs($this->user)->getJson('/api/v1/budgets');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    [
                        'category_id' => $this->category->id,
                        'allocated' => 500000,
                        'spent' => 200000,
                        'remaining' => 300000,
                        'percent_used' => 40,
                        'status' => 'safe',
                    ],
                ],
            ]);
    }

    public function test_mode_hemat_restricts_lifestyle_budget_cap(): void
    {
        $lifestyleCat = Category::create([
            'name' => 'Lifestyle & Hiburan',
            'slug' => 'lifestyle',
            'type' => 'expense',
            'is_system' => true,
        ]);

        // Activate Mode Hemat
        SelfLockSetting::create([
            'user_id' => $this->user->id,
            'is_active' => true,
            'lifestyle_budget_cap' => 100000,
        ]);

        // Try to allocate 200.000 for lifestyle while cap is 100.000
        $response = $this->actingAs($this->user)->postJson('/api/v1/budgets', [
            'category_id' => $lifestyleCat->id,
            'amount' => 200000,
            'month' => Carbon::now()->month,
            'year' => Carbon::now()->year,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }
}
