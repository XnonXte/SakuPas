<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\PayLaterBillRequest;
use App\Http\Requests\PayLaterRepaymentRequest;
use App\Models\PayLaterBill;
use App\Services\PayLaterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayLaterController extends BaseApiController
{
    public function __construct(
        protected PayLaterService $payLaterService
    ) {}

    /**
     * List all PayLater obligations for user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $bills = $this->payLaterService->getBillsForUser($user);

        return $this->successResponse($bills, 'Daftar kewajiban PayLater berhasil diambil.');
    }

    /**
     * Create a new PayLater bill.
     */
    public function store(PayLaterBillRequest $request): JsonResponse
    {
        $user = $request->user();
        $bill = $this->payLaterService->createBill($user, $request->validated());

        return $this->successResponse($bill, 'Tagihan PayLater berhasil ditambahkan.', 201);
    }

    /**
     * Show bill details.
     */
    public function show(Request $request, PayLaterBill $paylater): JsonResponse
    {
        if ($paylater->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke tagihan ini.', null, 403);
        }

        return $this->successResponse(
            $paylater->load('repayments.account'),
            'Detail tagihan PayLater berhasil diambil.'
        );
    }

    /**
     * Update PayLater bill.
     */
    public function update(PayLaterBillRequest $request, PayLaterBill $paylater): JsonResponse
    {
        if ($paylater->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke tagihan ini.', null, 403);
        }

        $updated = $this->payLaterService->updateBill($paylater, $request->validated());

        return $this->successResponse($updated, 'Tagihan PayLater berhasil diperbarui.');
    }

    /**
     * Delete PayLater bill.
     */
    public function destroy(Request $request, PayLaterBill $paylater): JsonResponse
    {
        if ($paylater->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke tagihan ini.', null, 403);
        }

        $this->payLaterService->deleteBill($paylater);

        return $this->successResponse(null, 'Tagihan PayLater berhasil dihapus.');
    }

    /**
     * Record a repayment for a bill.
     */
    public function recordRepayment(PayLaterRepaymentRequest $request, PayLaterBill $paylater): JsonResponse
    {
        if ($paylater->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke tagihan ini.', null, 403);
        }

        $repayment = $this->payLaterService->recordRepayment($paylater, $request->validated());

        return $this->successResponse([
            'repayment' => $repayment,
            'bill' => $paylater->fresh(),
        ], 'Pembayaran tagihan PayLater berhasil dicatat.', 201);
    }

    /**
     * Quick toggle bill paid status (full settlement or revert).
     */
    public function togglePaid(Request $request, PayLaterBill $paylater): JsonResponse
    {
        if ($paylater->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke tagihan ini.', null, 403);
        }

        $accountId = $request->input('account_id') ? (int) $request->input('account_id') : null;
        $updated = $this->payLaterService->togglePaid($paylater, $accountId);

        return $this->successResponse($updated, 'Status tagihan berhasil diperbarui.');
    }

    /**
     * List repayments history for a bill.
     */
    public function repayments(Request $request, PayLaterBill $paylater): JsonResponse
    {
        if ($paylater->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke tagihan ini.', null, 403);
        }

        return $this->successResponse(
            $paylater->repayments()->with('account')->orderBy('repayment_date', 'desc')->get(),
            'Riwayat pembayaran berhasil diambil.'
        );
    }
}
