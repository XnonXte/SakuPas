<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\BudgetRequest;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends BaseApiController
{
    public function __construct(
        protected BudgetService $budgetService
    ) {}

    /**
     * List monthly budget allocations with actual spending.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = $request->query('month') ? (int) $request->query('month') : null;
        $year = $request->query('year') ? (int) $request->query('year') : null;

        $budgets = $this->budgetService->getMonthlyBudgets($user, $month, $year);

        return $this->successResponse($budgets, 'Data alokasi budget berhasil diambil.');
    }

    /**
     * Create or update budget allocation.
     */
    public function store(BudgetRequest $request): JsonResponse
    {
        $user = $request->user();
        $budget = $this->budgetService->setBudgetAllocation($user, $request->validated());

        return $this->successResponse($budget, 'Alokasi budget berhasil disimpan.');
    }

    /**
     * Delete budget allocation.
     */
    public function destroy(Request $request, Budget $budget): JsonResponse
    {
        if ($budget->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke budget ini.', null, 403);
        }

        $this->budgetService->deleteBudget($budget);

        return $this->successResponse(null, 'Alokasi budget berhasil dihapus.');
    }
}
