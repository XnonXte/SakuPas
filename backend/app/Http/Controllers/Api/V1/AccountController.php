<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\AccountRequest;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends BaseApiController
{
    /**
     * List user's accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $accounts = $request->user()->accounts()->orderBy('id', 'asc')->get();

        return $this->successResponse($accounts, 'Daftar rekening berhasil diambil.');
    }

    /**
     * Create a new account.
     */
    public function store(AccountRequest $request): JsonResponse
    {
        $account = $request->user()->accounts()->create($request->validated());

        return $this->successResponse($account, 'Rekening berhasil ditambahkan.', 201);
    }

    /**
     * Show account details.
     */
    public function show(Request $request, Account $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke rekening ini.', null, 403);
        }

        return $this->successResponse($account, 'Detail rekening berhasil diambil.');
    }

    /**
     * Update account.
     */
    public function update(AccountRequest $request, Account $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke rekening ini.', null, 403);
        }

        $account->update($request->validated());

        return $this->successResponse($account, 'Rekening berhasil diperbarui.');
    }

    /**
     * Delete account.
     */
    public function destroy(Request $request, Account $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            return $this->errorResponse('Anda tidak memiliki akses ke rekening ini.', null, 403);
        }

        if ($account->transactions()->count() > 0) {
            return $this->errorResponse(
                'Rekening tidak dapat dihapus karena masih memiliki riwayat transaksi terkait.',
                null,
                422
            );
        }

        $account->delete();

        return $this->successResponse(null, 'Rekening berhasil dihapus.');
    }
}
