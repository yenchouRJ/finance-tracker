import { format, parse } from 'date-fns';

/**
 * Format a Date to display format DD/MM/YYYY
 */
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

/**
 * Format a Date to month display format MM/YYYY
 */
export function formatMonth(date: Date): string {
  return format(date, 'MM/yyyy');
}

/**
 * Get month key for queries (YYYY-MM format)
 */
export function getMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Parse a month key (YYYY-MM) back to a Date (first day of month)
 */
export function parseMonthKey(monthKey: string): Date {
  return parse(monthKey, 'yyyy-MM', new Date());
}

/**
 * Get ISO string for database storage
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Get today's date at midnight (local time)
 */
export function today(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Get current month key
 */
export function currentMonthKey(): string {
  return getMonthKey(new Date());
}
