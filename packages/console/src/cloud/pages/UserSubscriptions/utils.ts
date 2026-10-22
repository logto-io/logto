import { type Nullable } from '@silverhand/essentials';
import { type ComponentProps } from 'react';

import { type UserSubscription } from '@/cloud/types/router';
import type Tag from '@/ds-components/Tag';

/**
 * Format an amount in currency minor units. Invoices stored before Cloud persisted their currency
 * have none; show the number alone rather than assume a currency.
 */
export const formatCurrencyAmount = (
  amount: number,
  currency: Nullable<string>,
  locale: string
) => {
  if (!currency) {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }).format(amount / 100);
  }
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  // Stripe retains two-decimal API amounts for ISK/UGX despite their zero-decimal display.
  // https://docs.stripe.com/currencies#special-cases
  const digits = ['isk', 'ugx'].includes(currency.toLowerCase())
    ? 2
    : (formatter.resolvedOptions().maximumFractionDigits ?? 2);
  return formatter.format(amount / 10 ** digits);
};

/** Format a recurring list price in currency minor units, without estimating an invoice. */
export const formatUnitPrice = (
  price: UserSubscription['items'][number]['price'],
  locale: string
) =>
  price.unitAmount === null ? '—' : formatCurrencyAmount(price.unitAmount, price.currency, locale);

/** Name only known products; an unknown or missing product hint is never shown as Console SSO. */
export const getProductTitleKey = (product: Nullable<UserSubscription['product']>) =>
  product === 'console-sso'
    ? 'cloud.console_sso.title'
    : product === 'self-hosted-license'
      ? 'cloud.self_hosted_licenses.title'
      : 'enterprise_subscription.user_subscriptions.other_product';

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
