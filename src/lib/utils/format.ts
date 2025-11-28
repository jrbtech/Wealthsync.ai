import { format, formatDistanceToNow, differenceInDays, isValid } from 'date-fns';

// Currency formatting
export function formatCurrency(
  amount: number,
  options: { compact?: boolean; showCents?: boolean } = {}
): string {
  const { compact = false, showCents = false } = options;

  if (compact && Math.abs(amount) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }).format(amount);
}

// Date formatting
export function formatDate(date: Date | string | null | undefined, pattern = 'MMM d, yyyy'): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '';

  return format(d, pattern);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '';

  return formatDistanceToNow(d, { addSuffix: true });
}

export function getDaysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;

  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return null;

  return differenceInDays(d, new Date());
}

export function getDaysSince(date: Date | string | null | undefined): number | null {
  if (!date) return null;

  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return null;

  return differenceInDays(new Date(), d);
}

// Number formatting
export function formatNumber(num: number, options: { compact?: boolean } = {}): string {
  const { compact = false } = options;

  return new Intl.NumberFormat('en-US', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0
  }).format(num);
}

export function formatPercent(num: number, decimals = 1): string {
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Phone formatting
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

// Name initials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}
