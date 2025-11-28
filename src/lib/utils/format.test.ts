import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize,
  formatPhone,
  getInitials,
  truncate,
  pluralize
} from './format';

describe('formatCurrency', () => {
  it('formats basic currency without cents', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('formats currency with cents when specified', () => {
    expect(formatCurrency(1000, { showCents: true })).toBe('$1,000.00');
    expect(formatCurrency(1234.56, { showCents: true })).toBe('$1,234.56');
  });

  it('formats compact currency for large amounts', () => {
    expect(formatCurrency(1500000, { compact: true })).toBe('$1.5M');
    expect(formatCurrency(2500000000, { compact: true })).toBe('$2.5B');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-5000)).toBe('-$5,000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });
});

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats compact numbers', () => {
    expect(formatNumber(1500000, { compact: true })).toBe('1.5M');
  });
});

describe('formatPercent', () => {
  it('formats positive percentages with plus sign', () => {
    expect(formatPercent(5.5)).toBe('+5.5%');
    expect(formatPercent(10)).toBe('+10.0%');
  });

  it('formats negative percentages', () => {
    expect(formatPercent(-3.2)).toBe('-3.2%');
  });

  it('respects decimal places', () => {
    expect(formatPercent(5.567, 2)).toBe('+5.57%');
    expect(formatPercent(5, 0)).toBe('+5%');
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('handles zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});

describe('formatPhone', () => {
  it('formats 10-digit US phone numbers', () => {
    expect(formatPhone('5551234567')).toBe('(555) 123-4567');
    expect(formatPhone('555-123-4567')).toBe('(555) 123-4567');
  });

  it('formats 11-digit phone numbers with country code', () => {
    expect(formatPhone('15551234567')).toBe('+1 (555) 123-4567');
  });

  it('returns original if format not recognized', () => {
    expect(formatPhone('123')).toBe('123');
    expect(formatPhone('+44 20 7946 0958')).toBe('+44 20 7946 0958');
  });
});

describe('getInitials', () => {
  it('returns initials from full name', () => {
    expect(getInitials('John Smith')).toBe('JS');
    expect(getInitials('Jane Doe')).toBe('JD');
  });

  it('handles single names', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('limits to two initials', () => {
    expect(getInitials('John Paul Smith')).toBe('JP');
  });

  it('handles lowercase names', () => {
    expect(getInitials('john smith')).toBe('JS');
  });
});

describe('truncate', () => {
  it('truncates long text with ellipsis', () => {
    expect(truncate('This is a very long text', 15)).toBe('This is a ve...');
  });

  it('does not truncate short text', () => {
    expect(truncate('Short', 10)).toBe('Short');
  });

  it('handles exact length', () => {
    expect(truncate('Exact', 5)).toBe('Exact');
  });
});

describe('pluralize', () => {
  it('returns singular for count of 1', () => {
    expect(pluralize(1, 'item')).toBe('item');
    expect(pluralize(1, 'advisor')).toBe('advisor');
  });

  it('returns plural for count other than 1', () => {
    expect(pluralize(0, 'item')).toBe('items');
    expect(pluralize(2, 'item')).toBe('items');
    expect(pluralize(100, 'advisor')).toBe('advisors');
  });

  it('uses custom plural when provided', () => {
    expect(pluralize(2, 'entity', 'entities')).toBe('entities');
    expect(pluralize(0, 'person', 'people')).toBe('people');
  });
});
