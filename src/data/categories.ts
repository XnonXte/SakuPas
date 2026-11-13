import type { CategoryId, CategoryInfo } from '../types/finance';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  lifestyle: {
    id: 'lifestyle',
    name: 'Lifestyle & Hiburan',
    sublabel: 'TikTok Shop, Kafe & Jajan',
    icon: 'Sparkles',
    color: '#E9896A', // Terracotta
  },
  transportation: {
    id: 'transportation',
    name: 'Transportasi On-Demand',
    sublabel: 'Grab, Gojek & Bensin',
    icon: 'Navigation',
    color: '#343F56', // Slate Navy
  },
  groceries: {
    id: 'groceries',
    name: 'Kebutuhan Pokok & Makan',
    sublabel: 'Warteg, Makan Harian & Kos',
    icon: 'UtensilsCrossed',
    color: '#387C6D', // Sage Green
  },
  education: {
    id: 'education',
    name: 'Kuliah & Akademik',
    sublabel: 'Fotokopi, Buku & Print',
    icon: 'BookOpen',
    color: '#747B83', // Secondary Slate
  },
  allowance: {
    id: 'allowance',
    name: 'Uang Saku & Pemasukan',
    sublabel: 'Transfer Ortu & Beasiswa',
    icon: 'ArrowDownLeft',
    color: '#387C6D', // Sage Green
  },
  other: {
    id: 'other',
    name: 'Lain-lain',
    sublabel: 'Pengeluaran Tak Terduga',
    icon: 'CircleDot',
    color: '#747B83',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
