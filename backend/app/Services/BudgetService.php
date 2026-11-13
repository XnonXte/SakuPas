<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class BudgetService
{
    /**
     * Get budgets for a specific month and year with computed actual spending and statuses.
     */
    public function getMonthlyBudgets(User $user, ?int $month = null, ?int $year = null): Collection
    {
        $targetMonth = $month ?? Carbon::now()->month;
        $targetYear = $year ?? Carbon::now()->year;

        $startDate = Carbon::createFromDate($targetYear, $targetMonth, 1)->startOfMonth()->toDateString();
        $endDate = Carbon::createFromDate($targetYear, $targetMonth, 1)->endOfMonth()->toDateString();

        $budgets = $user->budgets()
            ->with('category')
            ->where('month', $targetMonth)
            ->where('year', $targetYear)
            ->get();

        // Calculate actual expense for each category from actual transactions
        $categoryExpenses = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('category_id, SUM(amount) as total_spent')
            ->groupBy('category_id')
            ->pluck('total_spent', 'category_id');

        $totalAllocated = $budgets->sum('amount');

        return $budgets->map(function (Budget $budget) use ($categoryExpenses, $totalAllocated) {
            $spent = (int) ($categoryExpenses[$budget->category_id] ?? 0);
            $allocated = (int) $budget->amount;
            $remaining = max(0, $allocated - $spent);
            $percentUsed = $allocated > 0 ? (int) min(999, round(($spent / $allocated) * 100)) : 0;
            $percentOfTotal = $totalAllocated > 0 ? (int) round(($allocated / $totalAllocated) * 100) : 0;

            if ($spent > $allocated) {
                $status = 'exceeded';
                $statusLabel = 'Melebihi Batas';
            } elseif ($percentUsed >= 70) {
                $status = 'warning';
                $statusLabel = 'Mendekati Batas';
            } else {
                $status = 'safe';
                $statusLabel = 'Aman';
            }

            return [
                'id' => $budget->id,
                'category_id' => $budget->category_id,
                'category_name' => $budget->category?->name ?? 'Kategori',
                'category_slug' => $budget->category?->slug ?? '',
                'category_icon' => $budget->category?->icon ?? 'CircleDot',
                'category_color' => $budget->category?->color ?? '#343F56',
                'category_sublabel' => $budget->category?->sublabel ?? '',
                'allocated' => $allocated,
                'spent' => $spent,
                'remaining' => $remaining,
                'percent_used' => $percentUsed,
                'percent_of_total' => $percentOfTotal,
                'status' => $status,
                'status_label' => $statusLabel,
                'month' => $budget->month,
                'year' => $budget->year,
            ];
        });
    }

    /**
     * Create or update a budget allocation for a category.
     */
    public function setBudgetAllocation(User $user, array $data): Budget
    {
        $amount = (int) $data['amount'];
        if ($amount < 0) {
            throw ValidationException::withMessages([
                'amount' => ['Alokasi budget tidak boleh bernilai negatif.'],
            ]);
        }

        $category = Category::findOrFail($data['category_id']);
        $month = $data['month'] ?? Carbon::now()->month;
        $year = $data['year'] ?? Carbon::now()->year;

        // Check if Mode Hemat is active and restricts lifestyle budget
        $selfLock = $user->selfLockSetting;
        if ($selfLock && $selfLock->is_active && $category->slug === 'lifestyle') {
            if ($amount > $selfLock->lifestyle_budget_cap) {
                throw ValidationException::withMessages([
                    'amount' => [
                        'Mode Hemat aktif: Alokasi kategori lifestyle dibatasi maksimal Rp' .
                        number_format($selfLock->lifestyle_budget_cap, 0, ',', '.') . ' demi menjaga sisa uang saku.',
                    ],
                ]);
            }
        }

        return Budget::updateOrCreate(
            [
                'user_id' => $user->id,
                'category_id' => $category->id,
                'month' => $month,
                'year' => $year,
            ],
            [
                'amount' => $amount,
            ]
        )->load('category');
    }

    /**
     * Delete a budget.
     */
    public function deleteBudget(Budget $budget): bool
    {
        return $budget->delete();
    }
}
