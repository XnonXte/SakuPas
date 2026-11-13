<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\PayLaterBill;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;
    protected Category $groceriesCat;
    protected Category $incomeCat;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->account = Account::create([
            'user_id' => $this->user->id,
            'name' => 'BCA',
            'balance' => 2500000,
        ]);

        $this->groceriesCat = Category::create([
            'name' => 'Warteg',
            'slug' => 'groceries',
            'type' => 'expense',
            'is_system' => true,
        ]);

        $this->incomeCat = Category::create([
            'name' => 'Uang Saku',
            'slug' => 'uang-saku',
            'type' => 'income',
            'is_system' => true,
        ]);
    }

    public function test_dashboard_returns_real_calculated_financial_data(): void
    {
        $now = Carbon::now();

        // Add expense
        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->groceriesCat->id,
            'type' => 'expense',
            'amount' => 50000,
            'description' => 'Makan',
            'transaction_date' => $now->toDateString(),
        ]);

        // Add bill
        PayLaterBill::create([
            'user_id' => $this->user->id,
            'provider_name' => 'Atome',
            'total_amount' => 150000,
            'paid_amount' => 0,
            'due_date' => $now->copy()->addDays(5)->toDateString(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/v1/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'financial_summary' => [
                        'main_balance' => 2500000,
                        'total_paylater' => 150000,
                        'upcoming_bill_amount' => 150000,
                        'monthly_expenses' => 50000,
                    ],
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'financial_summary',
                    'safe_to_spend' => [
                        'remaining_amount',
                        'percentage',
                        'status',
                        'daily_safe_spend',
                    ],
                    'recent_transactions',
                    'upcoming_bills',
                ],
            ]);
    }

    public function test_cash_flow_and_expense_distribution_endpoints(): void
    {
        $now = Carbon::now();

        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->groceriesCat->id,
            'type' => 'expense',
            'amount' => 30000,
            'description' => 'Makan',
            'transaction_date' => $now->toDateString(),
        ]);

        $responseFlow = $this->actingAs($this->user)->getJson('/api/v1/dashboard/cash-flow');
        $responseFlow->assertStatus(200);

        $responseDist = $this->actingAs($this->user)->getJson('/api/v1/dashboard/expense-distribution');
        $responseDist->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_expense' => 30000,
                ],
            ]);
    }
}
