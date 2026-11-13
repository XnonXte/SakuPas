<?php

namespace App\Services;

use App\Models\PayLaterBill;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class SafeToSpendService
{
    /**
     * Calculate Safe-to-Spend metrics using integer Rupiah arithmetic.
     *
     * Business logic:
     * - Total liquid balance across all user accounts
     * - Immediate obligations: upcoming unpaid PayLater bills
     * - Total monthly budget baseline
     * - Current month recorded expenses vs income
     * - Remaining days in current month
     */
    public function calculate(User $user, ?Carbon $date = null): array
    {
        $currentDate = $date ?? Carbon::now();
        $startOfMonth = $currentDate->copy()->startOfMonth()->toDateString();
        $endOfMonth = $currentDate->copy()->endOfMonth()->toDateString();

        // 1. Total liquid balance across user accounts
        $totalLiquidBalance = (int) $user->accounts()->sum('balance');

        // 2. Unpaid PayLater obligations due in current month (funds committed)
        $unpaidPayLaterDue = (int) $user->payLaterBills()
            ->where('status', '!=', 'paid')
            ->whereBetween('due_date', [$startOfMonth, $endOfMonth])
            ->get()
            ->sum(fn (PayLaterBill $bill) => $bill->outstanding_amount);

        // 3. Current month actual expenses & income
        $currentMonthExpenses = (int) $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $currentMonthIncome = (int) $user->transactions()
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // 4. Budget reference: sum of monthly budget allocations or default student discretionary threshold
        $totalBudgetSum = (int) $user->budgets()
            ->where('month', $currentDate->month)
            ->where('year', $currentDate->year)
            ->sum('amount');

        // If no budgets configured, use a sensible student monthly discretionary budget baseline
        $totalBudget = $totalBudgetSum > 0 ? $totalBudgetSum : 1180000;

        // 5. Calculate remaining safe spend capacity:
        // Available discretionary pool = balance minus immediate pending bills
        $discretionaryCapacity = max(0, $totalLiquidBalance - $unpaidPayLaterDue);

        // Safe spending limit from budget perspective:
        // Remaining budget = total budget minus expenses incurred
        $remainingBudgetCapacity = max(0, $totalBudget - $currentMonthExpenses);

        // The safe-to-spend is the minimum of available liquidity and remaining budget capacity,
        // ensuring the student never overspends their actual cash or their planned allocation.
        $safeToSpendAmount = min($discretionaryCapacity, $remainingBudgetCapacity);

        // If user has zero balance, safe to spend is zero
        if ($totalLiquidBalance <= 0) {
            $safeToSpendAmount = 0;
        }

        // Percentage of budget safe to spend
        $percentage = $totalBudget > 0
            ? (int) min(100, max(0, round(($safeToSpendAmount / $totalBudget) * 100)))
            : 0;

        // 6. Status determination
        if ($percentage < 30 || $safeToSpendAmount < 250000) {
            $status = 'danger';
            $statusLabel = 'Batas Bahaya';
        } elseif ($percentage < 60 || $safeToSpendAmount < 500000) {
            $status = 'warning';
            $statusLabel = 'Perlu Berhati-hati';
        } else {
            $status = 'safe';
            $statusLabel = 'Kondisi Aman';
        }

        // 7. Days remaining in current month
        $daysRemaining = max(1, $currentDate->copy()->endOfMonth()->day - $currentDate->day + 1);
        $dailySafeSpend = (int) round($safeToSpendAmount / $daysRemaining);

        return [
            'remaining_amount' => $safeToSpendAmount,
            'total_budget' => $totalBudget,
            'percentage' => $percentage,
            'status' => $status,
            'status_label' => $statusLabel,
            'daily_safe_spend' => $dailySafeSpend,
            'days_remaining' => $daysRemaining,
            'total_liquid_balance' => $totalLiquidBalance,
            'unpaid_paylater_due' => $unpaidPayLaterDue,
            'current_month_expenses' => $currentMonthExpenses,
            'current_month_income' => $currentMonthIncome,
        ];
    }
}
