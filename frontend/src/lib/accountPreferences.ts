export type CurrencyPreference = 'PHP' | 'USD';

export interface AccountPreferences {
  displayName: string;
  phone: string;
  currency: CurrencyPreference;
  profileImageDataUrl: string;
}

const STORAGE_PREFIX = 'accountPreferences:';
export const ACCOUNT_PREFERENCES_UPDATED_EVENT = 'account-preferences-updated';
const USD_PER_PHP = 1 / 56;

function readRaw(emailKey: string): Partial<AccountPreferences> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${emailKey}`);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<AccountPreferences>;
  } catch {
    return {};
  }
}

export function getAccountPreferences(
  emailKey: string,
  fallbackDisplayName: string,
): AccountPreferences {
  const stored = readRaw(emailKey);
  const currency = stored.currency === 'USD' ? 'USD' : 'PHP';
  return {
    displayName: stored.displayName?.trim() || fallbackDisplayName,
    phone: stored.phone?.trim() || '',
    currency,
    profileImageDataUrl: stored.profileImageDataUrl ?? '',
  };
}

export function saveAccountPreferences(emailKey: string, prefs: AccountPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}${emailKey}`, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent(ACCOUNT_PREFERENCES_UPDATED_EVENT, { detail: { emailKey } }));
}

export function formatAmountWithPreference(amountPhp: number, currency: CurrencyPreference): string {
  if (currency === 'USD') {
    const usd = amountPhp * USD_PER_PHP;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
  }
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amountPhp);
}

