import { conditional, type Nullable } from '@silverhand/essentials';

import { type UserSubscription } from '@/cloud/types/router';
import { getUpcomingBillAmount } from '@/utils/upcoming-invoice';

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

/** Ended subscriptions bill nothing more; they stay in Billing history only. */
export const isCurrentSubscription = ({ status }: UserSubscription) =>
  status !== 'canceled' && status !== 'incomplete_expired';

/** Only payment problems need a status tag; every other current state is business as usual. */
export const isPaymentOverdue = ({ status }: UserSubscription) =>
  status === 'past_due' || status === 'unpaid';

/** Stripe's canceledAt is a request timestamp, not the effective scheduled cancellation date. */
export const getScheduledCancellation = (subscription: UserSubscription) =>
  subscription.status !== 'canceled' &&
  (subscription.cancelAt ??
    (subscription.cancelAtPeriodEnd ? subscription.currentPeriodEnd : null));

/**
 * The next invoice of one subscription, dated at its own period end, and when the subscription
 * ends. A subscription that cancels by its period end has no next charge; a later cancellation
 * still renews at period end.
 */
export const getNextCharge = (
  subscription: UserSubscription
): { amount?: number; currency: Nullable<string>; chargeDate?: Date; endsAt?: Date } => {
  const scheduled = conditional(getScheduledCancellation(subscription));
  if (
    scheduled &&
    new Date(scheduled).getTime() <= new Date(subscription.currentPeriodEnd).getTime()
  ) {
    return { currency: null, endsAt: scheduled };
  }
  return {
    amount: getUpcomingBillAmount(subscription.upcomingInvoice),
    // Upcoming invoices carry no currency; a subscription's prices share the invoice currency.
    currency: subscription.items[0]?.price.currency ?? null,
    chargeDate: subscription.currentPeriodEnd,
    endsAt: scheduled,
  };
};
