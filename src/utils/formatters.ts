/**
 * Indonesian Rupiah Formatter
 * Format: Rp2.500.000 (standard Indonesian currency convention requested in prompt)
 */
export function formatIDR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}Rp${formatted}`;
}

/**
 * Parse IDR input string to numeric value
 */
export function parseIDRInput(raw: string): number {
  const digitsOnly = raw.replace(/\D/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

/**
 * Format date to Indonesian localized string
 */
export function formatIndonesianDate(dateStr: string, options?: { showDay?: boolean; shortMonth?: boolean }): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsFull = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthsShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = options?.shortMonth ? monthsShort[date.getMonth()] : monthsFull[date.getMonth()];
    const year = date.getFullYear();

    if (options?.showDay) {
      return `${dayName}, ${day} ${month} ${year}`;
    }
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate days remaining in current month
 */
export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
}

/**
 * Format relative due date (e.g. "5 hari lagi", "Hari ini", "Lewat 2 hari")
 */
export function formatRelativeDueDate(dueDateStr: string): { label: string; isUrgent: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Lewat ${Math.abs(diffDays)} hari`, isUrgent: true };
  } else if (diffDays === 0) {
    return { label: 'Jatuh tempo hari ini', isUrgent: true };
  } else if (diffDays === 1) {
    return { label: 'Besok', isUrgent: true };
  } else if (diffDays <= 7) {
    return { label: `${diffDays} hari lagi`, isUrgent: true };
  } else {
    return { label: `Dalam ${diffDays} hari`, isUrgent: false };
  }
}
