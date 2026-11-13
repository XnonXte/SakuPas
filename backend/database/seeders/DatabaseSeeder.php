<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\PayLaterBill;
use App\Models\SelfLockSetting;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed system categories
        $this->call(CategorySeeder::class);

        // 2. Create default development user
        $user = User::firstOrCreate(
            ['email' => 'rian@sakupas.id'],
            [
                'name' => 'Rian Pratama',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 3. Create user accounts
        $bca = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Rekening Utama BCA'],
            [
                'account_type' => 'bank',
                'balance' => 2100000,
                'description' => 'Rekening transfer orang tua dan beasiswa',
            ]
        );

        $gopay = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'GoPay'],
            [
                'account_type' => 'ewallet',
                'balance' => 250000,
                'description' => 'Dompet digital harian',
            ]
        );

        $cash = Account::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Tunai / Cash'],
            [
                'account_type' => 'cash',
                'balance' => 150000,
                'description' => 'Uang tunai di dompet',
            ]
        );

        // 4. Create PayLater obligations
        PayLaterBill::firstOrCreate(
            ['user_id' => $user->id, 'provider_name' => 'Atome Finance'],
            [
                'description' => 'Cicilan Sepatu Kuliah',
                'total_amount' => 150000,
                'paid_amount' => 0,
                'due_date' => Carbon::today()->addDays(5)->toDateString(),
                'status' => 'pending',
                'installment_info' => 'Cicilan 2 dari 3 (Sepatu Kuliah)',
            ]
        );

        PayLaterBill::firstOrCreate(
            ['user_id' => $user->id, 'provider_name' => 'TikTok Shop PayLater'],
            [
                'description' => 'Cicilan Tas Ransel & Hoodie',
                'total_amount' => 300000,
                'paid_amount' => 0,
                'due_date' => Carbon::today()->addDays(12)->toDateString(),
                'status' => 'pending',
                'installment_info' => 'Cicilan 1 dari 2 (Tas Ransel & Hoodie)',
            ]
        );

        // 5. Create Monthly Budgets for current month & year
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $groceriesCat = Category::where('slug', 'groceries')->first();
        $transportCat = Category::where('slug', 'transportation')->first();
        $lifestyleCat = Category::where('slug', 'lifestyle')->first();
        $educationCat = Category::where('slug', 'education')->first();
        $allowanceCat = Category::where('slug', 'uang-saku')->first();
        $partTimeCat = Category::where('slug', 'part-time')->first();

        if ($groceriesCat) {
            Budget::firstOrCreate(
                ['user_id' => $user->id, 'category_id' => $groceriesCat->id, 'month' => $currentMonth, 'year' => $currentYear],
                ['amount' => 800000]
            );
        }

        if ($transportCat) {
            Budget::firstOrCreate(
                ['user_id' => $user->id, 'category_id' => $transportCat->id, 'month' => $currentMonth, 'year' => $currentYear],
                ['amount' => 300000]
            );
        }

        if ($lifestyleCat) {
            Budget::firstOrCreate(
                ['user_id' => $user->id, 'category_id' => $lifestyleCat->id, 'month' => $currentMonth, 'year' => $currentYear],
                ['amount' => 400000]
            );
        }

        if ($educationCat) {
            Budget::firstOrCreate(
                ['user_id' => $user->id, 'category_id' => $educationCat->id, 'month' => $currentMonth, 'year' => $currentYear],
                ['amount' => 250000]
            );
        }

        // 6. Create Self-Lock Setting
        SelfLockSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'is_active' => false,
                'activated_at' => null,
                'lifestyle_budget_cap' => 100000,
                'hide_shopping_recommendations' => true,
            ]
        );

        // 7. Create realistic transactions for current month
        if (Transaction::where('user_id', $user->id)->count() === 0) {
            $now = Carbon::now();

            $mockTransactions = [
                [
                    'account_id' => $bca->id,
                    'category_id' => $allowanceCat?->id ?? 1,
                    'type' => 'income',
                    'amount' => 2500000,
                    'description' => 'Uang saku bulanan dari Orang Tua',
                    'transaction_date' => $now->copy()->startOfMonth()->toDateString(),
                    'payment_method' => 'Transfer Bank',
                ],
                [
                    'account_id' => $bca->id,
                    'category_id' => $partTimeCat?->id ?? 1,
                    'type' => 'income',
                    'amount' => 350000,
                    'description' => 'Honor asisten laboratorium gelombang 1',
                    'transaction_date' => $now->copy()->startOfMonth()->addDays(4)->toDateString(),
                    'payment_method' => 'Transfer Bank',
                ],
                [
                    'account_id' => $bca->id,
                    'category_id' => $groceriesCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 18000,
                    'description' => 'Warteg Bahari — Nasi ayam orek es teh',
                    'transaction_date' => $now->toDateString(),
                    'payment_method' => 'QRIS BCA',
                ],
                [
                    'account_id' => $gopay->id,
                    'category_id' => $transportCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 14000,
                    'description' => 'GrabBike — Kos ke Gedung Kuliah Bersama',
                    'transaction_date' => $now->toDateString(),
                    'payment_method' => 'GoPay',
                ],
                [
                    'account_id' => $gopay->id,
                    'category_id' => $lifestyleCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 68000,
                    'description' => 'TikTok Shop — Tumbler stainless & stiker',
                    'transaction_date' => $now->copy()->subDay()->toDateString(),
                    'payment_method' => 'GoPay',
                ],
                [
                    'account_id' => $bca->id,
                    'category_id' => $lifestyleCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 22000,
                    'description' => 'Kopi Kenangan — Kopi Kenangan Mantan',
                    'transaction_date' => $now->copy()->subDay()->toDateString(),
                    'payment_method' => 'QRIS BCA',
                ],
                [
                    'account_id' => $cash->id,
                    'category_id' => $educationCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 15000,
                    'description' => 'Fotokopi modul Statistika & jilid laporan',
                    'transaction_date' => $now->copy()->subDays(2)->toDateString(),
                    'payment_method' => 'Tunai',
                ],
                [
                    'account_id' => $bca->id,
                    'category_id' => $groceriesCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 25000,
                    'description' => 'Makan malam Warung Padang Murah',
                    'transaction_date' => $now->copy()->subDays(3)->toDateString(),
                    'payment_method' => 'QRIS BCA',
                ],
                [
                    'account_id' => $gopay->id,
                    'category_id' => $transportCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 16000,
                    'description' => 'GrabBike — Pulang praktikum kampus',
                    'transaction_date' => $now->copy()->subDays(3)->toDateString(),
                    'payment_method' => 'GoPay',
                ],
                [
                    'account_id' => $cash->id,
                    'category_id' => $groceriesCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 45000,
                    'description' => 'Refill galon Aqua & deterjen kos',
                    'transaction_date' => $now->copy()->subDays(4)->toDateString(),
                    'payment_method' => 'Tunai',
                ],
                [
                    'account_id' => $gopay->id,
                    'category_id' => $lifestyleCat?->id ?? 1,
                    'type' => 'expense',
                    'amount' => 35000,
                    'description' => 'Jajan camilan Indomaret bareng teman',
                    'transaction_date' => $now->copy()->subDays(5)->toDateString(),
                    'payment_method' => 'GoPay',
                ],
            ];

            foreach ($mockTransactions as $txData) {
                Transaction::create(array_merge($txData, ['user_id' => $user->id]));
            }
        }
    }
}
