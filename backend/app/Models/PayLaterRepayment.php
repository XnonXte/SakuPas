<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayLaterRepayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'pay_later_bill_id',
        'user_id',
        'account_id',
        'amount',
        'repayment_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'integer',
        'repayment_date' => 'date',
    ];

    public function bill(): BelongsTo
    {
        return $this->belongsTo(PayLaterBill::class, 'pay_later_bill_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
