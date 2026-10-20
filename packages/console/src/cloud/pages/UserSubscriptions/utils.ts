import { type UserSubscription } from '@/cloud/types/router';

/** Format a recurring list price in currency minor units, without estimating an invoice. */
export const formatUnitPrice = (
  price: UserSubscription['items'][number]['price'],
  locale: string
) => {
  if (price.unitAmount === null) {
    return '—';
  }
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: price.currency });
  // Stripe retains two-decimal API amounts for ISK/UGX despite their zero-decimal display.
  // https://docs.stripe.com/currencies#special-cases
  const digits = ['isk', 'ugx'].includes(price.currency.toLowerCase())
    ? 2
    : (formatter.resolvedOptions().maximumFractionDigits ?? 2);
  return formatter.format(price.unitAmount / 10 ** digits);
};

/** Localize Stripe's recurring interval, including multi-month or multi-year prices. */
export const formatPriceInterval = (
  price: UserSubscription['items'][number]['price'],
  locale: string
) =>
  price.interval && price.intervalCount
    ? new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: price.interval,
        unitDisplay: 'long',
      }).format(price.intervalCount)
    : undefined;

/** Stripe's canceledAt is a request timestamp, not the effective scheduled cancellation date. */
export const getScheduledCancellation = (subscription: UserSubscription) =>
  subscription.status !== 'canceled' &&
  (subscription.cancelAt ??
    (subscription.cancelAtPeriodEnd ? subscription.currentPeriodEnd : null));
