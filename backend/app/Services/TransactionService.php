<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    /**
     * Get filtered transaction query for a user.
     */
    public function getFilteredTransactions(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = $user->transactions()
            ->with(['account', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc');

        // Search query
        if (! empty($filters['search'])) {
            $search = '%' . strtolower($filters['search']) . '%';
            $query->where(function (Builder $q) use ($search) {
                $q->whereRaw('LOWER(description) LIKE ?', [$search])
                    ->orWhereRaw('LOWER(payment_method) LIKE ?', [$search])
                    ->orWhereHas('category', function (Builder $cq) use ($search) {
                        $cq->whereRaw('LOWER(name) LIKE ?', [$search]);
                    });
            });
        }

        // Category filter
        if (! empty($filters['category_id']) && $filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        } elseif (! empty($filters['category_slug']) && $filters['category_slug'] !== 'all') {
            $query->whereHas('category', function (Builder $cq) use ($filters) {
                $cq->where('slug', $filters['category_slug']);
            });
        }

        // Type filter (income/expense)
        if (! empty($filters['type']) && in_array($filters['type'], ['income', 'expense'])) {
            $query->where('type', $filters['type']);
        }

        // Month filter (format YYYY-MM)
        if (! empty($filters['month']) && $filters['month'] !== 'all') {
            $query->whereRaw("strftime('%Y-%m', transaction_date) = ?", [$filters['month']]);
        }

        // Date range
        if (! empty($filters['start_date'])) {
            $query->where('transaction_date', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->where('transaction_date', '<=', $filters['end_date']);
        }

        $perPage = ! empty($filters['per_page']) ? (int) $filters['per_page'] : 50;

        return $query->paginate($perPage);
    }

    /**
     * Create a new transaction with atomic account balance update.
     */
    public function create(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data) {
            $account = Account::where('id', $data['account_id'])
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $category = Category::where('id', $data['category_id'])
                ->where(function (Builder $q) use ($user) {
                    $q->whereNull('user_id')->orWhere('user_id', $user->id);
                })
                ->firstOrFail();

            $amount = (int) $data['amount'];
            if ($amount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => ['Nominal transaksi harus lebih besar dari 0.'],
                ]);
            }

            $type = $data['type'];
            if (! in_array($type, ['income', 'expense'])) {
                throw ValidationException::withMessages([
                    'type' => ['Jenis transaksi harus berupa income atau expense.'],
                ]);
            }

            // Create transaction record
            $transaction = $user->transactions()->create([
                'account_id' => $account->id,
                'category_id' => $category->id,
                'type' => $type,
                'amount' => $amount,
                'description' => $data['description'],
                'transaction_date' => $data['transaction_date'],
                'payment_method' => $data['payment_method'] ?? $account->name,
                'notes' => $data['notes'] ?? null,
            ]);

            // Update account balance
            if ($type === 'income') {
                $account->balance += $amount;
            } else {
                $account->balance -= $amount;
            }
            $account->save();

            return $transaction->load(['account', 'category']);
        });
    }

    /**
     * Update an existing transaction with atomic account balance reversal and re-application.
     */
    public function update(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            $user = $transaction->user;

            // 1. Revert previous impact on original account
            $originalAccount = Account::where('id', $transaction->account_id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($transaction->type === 'income') {
                $originalAccount->balance -= $transaction->amount;
            } else {
                $originalAccount->balance += $transaction->amount;
            }
            $originalAccount->save();

            // 2. Identify target account and category
            $targetAccountId = $data['account_id'] ?? $transaction->account_id;
            $targetAccount = $targetAccountId === $originalAccount->id
                ? $originalAccount
                : Account::where('id', $targetAccountId)
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->firstOrFail();

            $targetCategoryId = $data['category_id'] ?? $transaction->category_id;
            $category = Category::where('id', $targetCategoryId)
                ->where(function (Builder $q) use ($user) {
                    $q->whereNull('user_id')->orWhere('user_id', $user->id);
                })
                ->firstOrFail();

            $newAmount = isset($data['amount']) ? (int) $data['amount'] : $transaction->amount;
            if ($newAmount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => ['Nominal transaksi harus lebih besar dari 0.'],
                ]);
            }

            $newType = $data['type'] ?? $transaction->type;

            // 3. Update transaction record
            $transaction->update([
                'account_id' => $targetAccount->id,
                'category_id' => $category->id,
                'type' => $newType,
                'amount' => $newAmount,
                'description' => $data['description'] ?? $transaction->description,
                'transaction_date' => $data['transaction_date'] ?? $transaction->transaction_date,
                'payment_method' => $data['payment_method'] ?? $transaction->payment_method,
                'notes' => $data['notes'] ?? $transaction->notes,
            ]);

            // 4. Apply new impact on target account
            if ($newType === 'income') {
                $targetAccount->balance += $newAmount;
            } else {
                $targetAccount->balance -= $newAmount;
            }
            $targetAccount->save();

            return $transaction->load(['account', 'category']);
        });
    }

    /**
     * Delete a transaction and reverse its balance impact.
     */
    public function delete(Transaction $transaction): bool
    {
        return DB::transaction(function () use ($transaction) {
            $account = Account::where('id', $transaction->account_id)
                ->where('user_id', $transaction->user_id)
                ->lockForUpdate()
                ->first();

            if ($account) {
                if ($transaction->type === 'income') {
                    $account->balance -= $transaction->amount;
                } else {
                    $account->balance += $transaction->amount;
                }
                $account->save();
            }

            return $transaction->delete();
        });
    }
}
