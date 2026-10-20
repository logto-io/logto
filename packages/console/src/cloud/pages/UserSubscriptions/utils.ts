import { type ComponentProps } from 'react';

import { type UserSubscription } from '@/cloud/types/router';
import type Tag from '@/ds-components/Tag';

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

/** Localize Stripe's recurring interval: "month" for a single interval, "3 months" otherwise. */
export const formatPriceInterval = (
  price: UserSubscription['items'][number]['price'],
  locale: string
) => {
  if (!price.interval || !price.intervalCount) {
    return;
  }
  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: price.interval,
    unitDisplay: 'long',
  });
  if (price.intervalCount > 1) {
    return formatter.format(price.intervalCount);
  }
  return formatter
    .formatToParts(1)
    .filter(({ type }) => type === 'unit')
    .map(({ value }) => value)
    .join('')
    .trim();
};

/** Highlight states that need payment attention; ended or paused states stay neutral. */
export const statusTagMap: Record<
  UserSubscription['status'],
  NonNullable<ComponentProps<typeof Tag>['status']>
> = {
  active: 'success',
  trialing: 'success',
  past_due: 'error',
  unpaid: 'error',
  incomplete: 'alert',
  incomplete_expired: 'info',
  canceled: 'info',
  paused: 'info',
};

/** Stripe's canceledAt is a request timestamp, not the effective scheduled cancellation date. */
export const getScheduledCancellation = (subscription: UserSubscription) =>
  subscription.status !== 'canceled' &&
  (subscription.cancelAt ??
    (subscription.cancelAtPeriodEnd ? subscription.currentPeriodEnd : null));
