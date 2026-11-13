<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayLaterBill extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider_name',
        'description',
        'total_amount',
        'paid_amount',
        'due_date',
        'status',
        'installment_info',
    ];

    protected $casts = [
        'total_amount' => 'integer',
        'paid_amount' => 'integer',
        'due_date' => 'date',
    ];

    protected $appends = [
        'outstanding_amount',
        'computed_status',
        'days_remaining',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function repayments(): HasMany
    {
        return $this->hasMany(PayLaterRepayment::class);
    }

    public function getOutstandingAmountAttribute(): int
    {
        return max(0, (int) $this->total_amount - (int) $this->paid_amount);
    }

    public function getComputedStatusAttribute(): string
    {
        if ($this->paid_amount >= $this->total_amount) {
            return 'paid';
        }

        $due = Carbon::parse($this->due_date)->startOfDay();
        $today = Carbon::today();

        if ($today->gt($due)) {
            return 'overdue';
        }

        if ($this->paid_amount > 0) {
            return 'partially_paid';
        }

        return 'pending';
    }

    public function getDaysRemainingAttribute(): int
    {
        $due = Carbon::parse($this->due_date)->startOfDay();
        $today = Carbon::today();
        return (int) $today->diffInDays($due, false);
    }
}
