<?php

namespace App\Services;

use App\Models\Account;
use App\Models\PayLaterBill;
use App\Models\PayLaterRepayment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayLaterService
{
    /**
     * Get all PayLater bills for user with calculated statuses.
     */
    public function getBillsForUser(User $user): Collection
    {
        $bills = $user->payLaterBills()
            ->with('repayments')
            ->orderBy('due_date', 'asc')
            ->get();

        // Update overdue status in database if passed due date and not fully paid
        $today = Carbon::today();
        foreach ($bills as $bill) {
            $computed = $bill->computed_status;
            if ($bill->status !== $computed) {
                $bill->status = $computed;
                $bill->save();
            }
        }

        return $bills;
    }

    /**
     * Create a new PayLater bill.
     */
    public function createBill(User $user, array $data): PayLaterBill
    {
        $totalAmount = (int) $data['total_amount'];
        if ($totalAmount <= 0) {
            throw ValidationException::withMessages([
                'total_amount' => ['Total tagihan harus lebih besar dari 0.'],
            ]);
        }

        $dueDate = Carbon::parse($data['due_date']);
        $initialStatus = $dueDate->isPast() ? 'overdue' : 'pending';

        return $user->payLaterBills()->create([
            'provider_name' => $data['provider_name'],
            'description' => $data['description'] ?? null,
            'total_amount' => $totalAmount,
            'paid_amount' => 0,
            'due_date' => $dueDate->toDateString(),
            'status' => $initialStatus,
            'installment_info' => $data['installment_info'] ?? null,
        ]);
    }

    /**
     * Update PayLater bill details.
     */
    public function updateBill(PayLaterBill $bill, array $data): PayLaterBill
    {
        $totalAmount = isset($data['total_amount']) ? (int) $data['total_amount'] : $bill->total_amount;
        if ($totalAmount < $bill->paid_amount) {
            throw ValidationException::withMessages([
                'total_amount' => ['Total tagihan tidak boleh lebih kecil dari jumlah yang sudah dibayar.'],
            ]);
        }

        $dueDate = isset($data['due_date']) ? Carbon::parse($data['due_date']) : Carbon::parse($bill->due_date);

        $bill->update([
            'provider_name' => $data['provider_name'] ?? $bill->provider_name,
            'description' => $data['description'] ?? $bill->description,
            'total_amount' => $totalAmount,
            'due_date' => $dueDate->toDateString(),
            'installment_info' => $data['installment_info'] ?? $bill->installment_info,
        ]);

        $bill->status = $bill->computed_status;
        $bill->save();

        return $bill->fresh();
    }

    /**
     * Record a repayment with atomic balance and status updates.
     */
    public function recordRepayment(PayLaterBill $bill, array $data): PayLaterRepayment
    {
        return DB::transaction(function () use ($bill, $data) {
            $user = $bill->user;
            $repaymentAmount = (int) $data['amount'];

            if ($repaymentAmount <= 0) {
                throw ValidationException::withMessages([
                    'amount' => ['Nominal pembayaran harus lebih besar dari 0.'],
                ]);
            }

            $outstanding = $bill->outstanding_amount;
            if ($repaymentAmount > $outstanding) {
                throw ValidationException::withMessages([
                    'amount' => ["Nominal pembayaran (Rp" . number_format($repaymentAmount, 0, ',', '.') . ") melebihi sisa tagihan (Rp" . number_format($outstanding, 0, ',', '.') . ")."],
                ]);
            }

            // Deduct from account if account_id is provided
            $account = null;
            if (! empty($data['account_id'])) {
                $account = Account::where('id', $data['account_id'])
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($account->balance < $repaymentAmount) {
                    throw ValidationException::withMessages([
                        'account_id' => ['Saldo rekening tidak mencukupi untuk pembayaran ini.'],
                    ]);
                }

                $account->balance -= $repaymentAmount;
                $account->save();
            }

            // Create repayment record
            $repayment = PayLaterRepayment::create([
                'pay_later_bill_id' => $bill->id,
                'user_id' => $user->id,
                'account_id' => $account?->id,
                'amount' => $repaymentAmount,
                'repayment_date' => $data['repayment_date'] ?? Carbon::today()->toDateString(),
                'notes' => $data['notes'] ?? 'Pembayaran tagihan ' . $bill->provider_name,
            ]);

            // Update bill paid_amount and status
            $bill->paid_amount += $repaymentAmount;
            $bill->status = $bill->computed_status;
            $bill->save();

            return $repayment;
        });
    }

    /**
     * Mark an obligation as fully paid or toggle back to unpaid.
     */
    public function togglePaid(PayLaterBill $bill, ?int $accountId = null): PayLaterBill
    {
        return DB::transaction(function () use ($bill, $accountId) {
            if ($bill->status === 'paid') {
                // Revert full payment: reset paid_amount to 0, remove repayments
                $bill->repayments()->delete();
                $bill->paid_amount = 0;
                $bill->status = $bill->computed_status;
                $bill->save();
            } else {
                // Pay remaining outstanding amount
                $remainingToPay = $bill->outstanding_amount;
                if ($remainingToPay > 0) {
                    $this->recordRepayment($bill, [
                        'amount' => $remainingToPay,
                        'account_id' => $accountId,
                        'repayment_date' => Carbon::today()->toDateString(),
                        'notes' => 'Pelunasan tagihan ' . $bill->provider_name,
                    ]);
                }
            }

            return $bill->fresh();
        });
    }

    /**
     * Delete a PayLater bill.
     */
    public function deleteBill(PayLaterBill $bill): bool
    {
        return $bill->delete();
    }
}
