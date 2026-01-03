/**
 * HealthFlow Mobile App - Utility Functions
 * 
 * Common utility functions used throughout the app.
 */

/**
 * Format date for display (Egyptian locale)
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  
  return new Date(dateStr).toLocaleDateString('en-EG', options || defaultOptions);
}

/**
 * Format date and time
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateStr);
}

/**
 * Format time remaining until a deadline
 */
export function formatTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}m remaining`;

  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  
  if (diffHours < 24) {
    return remainingMins > 0 
      ? `${diffHours}h ${remainingMins}m remaining`
      : `${diffHours}h remaining`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d remaining`;
}

/**
 * Check if a date is expired
 */
export function isExpired(dateStr: string): boolean {
  return new Date(dateStr) <= new Date();
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Truncate DID for display
 */
export function truncateDID(did: string): string {
  if (did.length <= 40) return did;
  return did.slice(0, 20) + '...' + did.slice(-12);
}

/**
 * Format document type for display
 */
export function formatDocumentType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate random ID
 */
export function generateId(prefix = ''): string {
  const random = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Validate Egyptian National ID format
 */
export function isValidNationalId(id: string): boolean {
  // Egyptian National ID: 14 digits
  return /^\d{14}$/.test(id);
}

/**
 * Validate DID format
 */
export function isValidDID(did: string): boolean {
  // Basic validation for did:web format
  const parts = did.split(':');
  return parts.length >= 4 && parts[0] === 'did' && parts[1] === 'web';
}

/**
 * Extract UUID from DID
 */
export function extractUUIDFromDID(did: string): string | null {
  const parts = did.split(':');
  if (parts.length < 4) return null;
  return parts[parts.length - 1];
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by date (newest first)
 */
export function sortByDate<T>(array: T[], dateKey: keyof T, ascending = false): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey] as string).getTime();
    const dateB = new Date(b[dateKey] as string).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
