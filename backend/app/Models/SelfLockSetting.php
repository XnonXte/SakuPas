<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SelfLockSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'is_active',
        'activated_at',
        'lifestyle_budget_cap',
        'hide_shopping_recommendations',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'activated_at' => 'datetime',
        'lifestyle_budget_cap' => 'integer',
        'hide_shopping_recommendations' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
