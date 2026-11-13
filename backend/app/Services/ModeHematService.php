<?php

namespace App\Services;

use App\Models\SelfLockSetting;
use App\Models\User;
use Carbon\Carbon;

class ModeHematService
{
    /**
     * Get or create Self-Lock settings for a user.
     */
    public function getSettings(User $user): SelfLockSetting
    {
        return SelfLockSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'is_active' => false,
                'activated_at' => null,
                'lifestyle_budget_cap' => 100000,
                'hide_shopping_recommendations' => true,
            ]
        );
    }

    /**
     * Activate Self-Lock.
     */
    public function activate(User $user): SelfLockSetting
    {
        $setting = $this->getSettings($user);
        $setting->update([
            'is_active' => true,
            'activated_at' => Carbon::now(),
        ]);

        return $setting;
    }

    /**
     * Deactivate Self-Lock.
     */
    public function deactivate(User $user): SelfLockSetting
    {
        $setting = $this->getSettings($user);
        $setting->update([
            'is_active' => false,
        ]);

        return $setting;
    }

    /**
     * Get restriction configuration payload.
     */
    public function getRestrictionsPayload(SelfLockSetting $setting): array
    {
        return [
            'is_active' => $setting->is_active,
            'activated_at' => $setting->activated_at?->toIso8601String(),
            'restrictions' => [
                'hide_shopping_recommendations' => (bool) $setting->hide_shopping_recommendations,
                'lifestyle_budget_cap' => (int) $setting->lifestyle_budget_cap,
                'rules' => [
                    [
                        'id' => 'hide_recommendations',
                        'title' => 'Menyembunyikan Rekomendasi Belanja',
                        'description' => 'Menghilangkan etalase flash sale, notifikasi promo, dan diskon impulsif di dalam aplikasi.',
                        'is_enforced' => $setting->is_active,
                    ],
                    [
                        'id' => 'cap_lifestyle',
                        'title' => 'Membatasi Alokasi Budget Lifestyle',
                        'description' => 'Membatasi budget kategori gaya hidup maksimal Rp' . number_format($setting->lifestyle_budget_cap, 0, ',', '.') . ' agar uang saku terjaga.',
                        'is_enforced' => $setting->is_active,
                    ],
                ],
            ],
        ];
    }
}
