<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\DashboardService;
use App\Services\SafeToSpendService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends BaseApiController
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected SafeToSpendService $safeToSpendService
    ) {}

    /**
     * Dashboard overview.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $summary = $this->dashboardService->getSummary($user);

        return $this->successResponse($summary, 'Data dashboard berhasil diambil.');
    }

    /**
     * Monthly cash flow chart data.
     */
    public function cashFlow(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = $request->query('month') ? (int) $request->query('month') : null;
        $year = $request->query('year') ? (int) $request->query('year') : null;

        $cashFlow = $this->dashboardService->getCashFlow($user, $month, $year);

        return $this->successResponse($cashFlow, 'Data arus kas bulanan berhasil diambil.');
    }

    /**
     * Expense distribution for donut chart.
     */
    public function expenseDistribution(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = $request->query('month') ? (int) $request->query('month') : null;
        $year = $request->query('year') ? (int) $request->query('year') : null;

        $distribution = $this->dashboardService->getExpenseDistribution($user, $month, $year);

        return $this->successResponse($distribution, 'Distribusi pengeluaran berhasil diambil.');
    }

    /**
     * Dedicated Safe-to-Spend endpoint.
     */
    public function safeToSpend(Request $request): JsonResponse
    {
        $user = $request->user();
        $safeToSpend = $this->safeToSpendService->calculate($user);

        return $this->successResponse($safeToSpend, 'Kalkulasi Safe-to-Spend berhasil.');
    }
}
