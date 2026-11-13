<?php

namespace App\Services;

use App\Models\PayLaterBill;
use App\Models\User;
use Carbon\Carbon;

class DashboardService
{
    public function __construct(
        protected SafeToSpendService $safeToSpendService,
        protected ModeHematService $modeHematService
    ) {}

    /**
     * Get complete dashboard summary.
     */
    public function getSummary(User $user): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth()->toDateString();
        $endOfMonth = $now->copy()->endOfMonth()->toDateString();

        // 1. Total liquid balance across all user accounts
        $mainBalance = (int) $user->accounts()->sum('balance');

        // 2. PayLater totals & upcoming bill
        $bills = $user->payLaterBills()
            ->where('status', '!=', 'paid')
            ->orderBy('due_date', 'asc')
            ->get();

        $totalPayLater = (int) $bills->sum(fn (PayLaterBill $b) => $b->outstanding_amount);
        $nearestBill = $bills->first();
        $upcomingBillAmount = $nearestBill ? $nearestBill->outstanding_amount : 0;

        // 3. Transactions this month
        $monthlyIncome = (int) $user->transactions()
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $monthlyExpenses = (int) $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $transactionCount = (int) $user->transactions()
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->count();

        // 4. Safe-to-Spend calculation
        $safeToSpend = $this->safeToSpendService->calculate($user, $now);

        // 5. Recent transactions (latest 5)
        $recentTransactions = $user->transactions()
            ->with(['account', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        // 6. Upcoming PayLater bills list
        $upcomingBills = $user->payLaterBills()
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get();

        // 7. Mode Hemat state
        $selfLock = $this->modeHematService->getSettings($user);

        return [
            'financial_summary' => [
                'main_balance' => $mainBalance,
                'total_paylater' => $totalPayLater,
                'upcoming_bill_amount' => $upcomingBillAmount,
                'monthly_income' => $monthlyIncome,
                'monthly_expenses' => $monthlyExpenses,
                'transaction_count' => $transactionCount,
            ],
            'safe_to_spend' => $safeToSpend,
            'recent_transactions' => $recentTransactions,
            'upcoming_bills' => $upcomingBills,
            'mode_hemat' => [
                'is_active' => (bool) $selfLock->is_active,
                'activated_at' => $selfLock->activated_at?->toIso8601String(),
            ],
        ];
    }

    /**
     * Get daily cash flow data for current month (income vs expense).
     */
    public function getCashFlow(User $user, ?int $month = null, ?int $year = null): array
    {
        $targetMonth = $month ?? Carbon::now()->month;
        $targetYear = $year ?? Carbon::now()->year;

        $startDate = Carbon::createFromDate($targetYear, $targetMonth, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($targetYear, $targetMonth, 1)->endOfMonth();

        $transactions = $user->transactions()
            ->whereBetween('transaction_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('transaction_date', 'asc')
            ->get();

        $dailyData = [];
        $runningBalance = (int) $user->accounts()->sum('balance');

        // Group into timeline days
        $daysInMonth = $endDate->day;
        $step = max(1, (int) ceil($daysInMonth / 8)); // 7-8 points across the month

        $daysPoints = [1, 5, 8, 11, 15, 20, 25, $daysInMonth];

        foreach ($daysPoints as $dayNum) {
            $pointDate = Carbon::createFromDate($targetYear, $targetMonth, min($dayNum, $daysInMonth));
            $pointDateStr = $pointDate->toDateString();

            // Sum income and expense up to this point or on this interval
            $dayIncome = $transactions
                ->filter(fn ($t) => $t->type === 'income' && $t->transaction_date->day <= $dayNum && $t->transaction_date->day > ($dayNum - $step))
                ->sum('amount');

            $dayExpense = $transactions
                ->filter(fn ($t) => $t->type === 'expense' && $t->transaction_date->day <= $dayNum && $t->transaction_date->day > ($dayNum - $step))
                ->sum('amount');

            $dailyData[] = [
                'day' => $pointDate->translatedFormat('d M'),
                'day_number' => $pointDate->day,
                'date' => $pointDateStr,
                'pemasukan' => (int) $dayIncome,
                'pengeluaran' => (int) $dayExpense,
                'saldo_proyeksi' => (int) max(0, $runningBalance - $dayExpense + $dayIncome),
            ];
        }

        return $dailyData;
    }

    /**
     * Get expense distribution grouped by category for donut chart.
     */
    public function getExpenseDistribution(User $user, ?int $month = null, ?int $year = null): array
    {
        $targetMonth = $month ?? Carbon::now()->month;
        $targetYear = $year ?? Carbon::now()->year;

        $startDate = Carbon::createFromDate($targetYear, $targetMonth, 1)->startOfMonth()->toDateString();
        $endDate = Carbon::createFromDate($targetYear, $targetMonth, 1)->endOfMonth()->toDateString();

        $categoryExpenses = $user->transactions()
            ->with('category')
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('category_id, SUM(amount) as total_amount')
            ->groupBy('category_id')
            ->get();

        $totalExpense = $categoryExpenses->sum('total_amount');

        $brandColors = [
            '#E9896A', // Terracotta
            '#387C6D', // Sage Green
            '#343F56', // Slate Navy
            '#747B83', // Secondary Slate
            '#d68f77', // Soft warm terracotta
            '#599587', // Soft sage
        ];

        $items = $categoryExpenses->map(function ($item, $idx) use ($totalExpense, $brandColors) {
            $amount = (int) $item->total_amount;
            $percent = $totalExpense > 0 ? (int) round(($amount / $totalExpense) * 100) : 0;

            return [
                'category_id' => $item->category_id,
                'category_name' => $item->category?->name ?? 'Lain-lain',
                'category_slug' => $item->category?->slug ?? 'other',
                'amount' => $amount,
                'percentage' => $percent,
                'color' => $item->category?->color ?? $brandColors[$idx % count($brandColors)],
            ];
        })->sortByDesc('amount')->values()->all();

        return [
            'total_expense' => (int) $totalExpense,
            'items' => $items,
        ];
    }
}
