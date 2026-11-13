<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Income
            [
                'name' => 'Uang Saku',
                'slug' => 'uang-saku',
                'type' => 'income',
                'sublabel' => 'Transfer Orang Tua',
                'icon' => 'ArrowDownLeft',
                'color' => '#387C6D',
                'is_system' => true,
            ],
            [
                'name' => 'Beasiswa',
                'slug' => 'beasiswa',
                'type' => 'income',
                'sublabel' => 'Beasiswa Kampus & Pemerintah',
                'icon' => 'Award',
                'color' => '#387C6D',
                'is_system' => true,
            ],
            [
                'name' => 'Part-time & Freelance',
                'slug' => 'part-time',
                'type' => 'income',
                'sublabel' => 'Gaji Sampingan & Asdos',
                'icon' => 'Briefcase',
                'color' => '#387C6D',
                'is_system' => true,
            ],
            [
                'name' => 'Pemasukan Lainnya',
                'slug' => 'other-income',
                'type' => 'income',
                'sublabel' => 'Hadiah, Cashback, dll',
                'icon' => 'ArrowDownLeft',
                'color' => '#747B83',
                'is_system' => true,
            ],

            // Expenses
            [
                'name' => 'Kebutuhan Pokok & Makan',
                'slug' => 'groceries',
                'type' => 'expense',
                'sublabel' => 'Warteg, Makan Harian & Kos',
                'icon' => 'UtensilsCrossed',
                'color' => '#387C6D',
                'is_system' => true,
            ],
            [
                'name' => 'Transportasi On-Demand',
                'slug' => 'transportation',
                'type' => 'expense',
                'sublabel' => 'Grab, Gojek & Bensin',
                'icon' => 'Navigation',
                'color' => '#343F56',
                'is_system' => true,
            ],
            [
                'name' => 'Lifestyle & Hiburan',
                'slug' => 'lifestyle',
                'type' => 'expense',
                'sublabel' => 'TikTok Shop, Kafe & Jajan',
                'icon' => 'Sparkles',
                'color' => '#E9896A',
                'is_system' => true,
            ],
            [
                'name' => 'Kuliah & Akademik',
                'slug' => 'education',
                'type' => 'expense',
                'sublabel' => 'Fotokopi, Buku & Print',
                'icon' => 'BookOpen',
                'color' => '#747B83',
                'is_system' => true,
            ],
            [
                'name' => 'Belanja Online',
                'slug' => 'online-shopping',
                'type' => 'expense',
                'sublabel' => 'Shopee, Tokopedia, TikTok',
                'icon' => 'ShoppingBag',
                'color' => '#E9896A',
                'is_system' => true,
            ],
            [
                'name' => 'Tagihan & Langganan',
                'slug' => 'bills',
                'type' => 'expense',
                'sublabel' => 'Pulsa, Listrik Kos, Kuota',
                'icon' => 'Receipt',
                'color' => '#343F56',
                'is_system' => true,
            ],
            [
                'name' => 'Lain-lain',
                'slug' => 'other',
                'type' => 'expense',
                'sublabel' => 'Pengeluaran Tak Terduga',
                'icon' => 'CircleDot',
                'color' => '#747B83',
                'is_system' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug'], 'user_id' => null],
                $cat
            );
        }
    }
}
