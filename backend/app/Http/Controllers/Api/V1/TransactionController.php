<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends BaseApiController
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    /**
     * List transactions with search, filters, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only([
            'search',
            'category_id',
            'category_slug',
            'type',
            'month',
            'start_date',
            'end_date',
            'per_page',
        ]);

        $paginator = $this->transactionService->getFilteredTransactions($user, $filters);

        return $this->successResponse([
            'items' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Daftar transaksi berhasil diambil.');
    }

    /**
     * Store a newly created transaction.
     */
    public function store(TransactionRequest $request): JsonResponse
    {
        $user = $request->user();
        $transaction = $this->transactionService->create($user, $request->validated());

        return $this->successResponse($transaction, 'Transaksi berhasil disimpan.', 201);
    }

    /**
     * Display a single transaction.
     */
    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke transaksi ini.', null, 403);
        }

        return $this->successResponse(
            $transaction->load(['account', 'category']),
            'Detail transaksi berhasil diambil.'
        );
    }

    /**
     * Update an existing transaction.
     */
    public function update(TransactionRequest $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke transaksi ini.', null, 403);
        }

        $updated = $this->transactionService->update($transaction, $request->validated());

        return $this->successResponse($updated, 'Transaksi berhasil diperbarui.');
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke transaksi ini.', null, 403);
        }

        $this->transactionService->delete($transaction);

        return $this->successResponse(null, 'Transaksi berhasil dihapus.');
    }
}
