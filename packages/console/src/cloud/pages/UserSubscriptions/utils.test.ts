import { type UserSubscription } from '@/cloud/types/router';

import { formatPriceInterval, formatUnitPrice, getScheduledCancellation } from './utils';

const price: UserSubscription['items'][number]['price'] = {
  id: 'price-sso',
  productId: 'product-sso',
  unitAmount: 12_800,
  currency: 'usd',
  interval: 'month',
  intervalCount: 1,
};
const subscription: UserSubscription = {
  id: 'sub-sso',
  product: null,
  status: 'active',
  currentPeriodStart: new Date('2026-10-01'),
  currentPeriodEnd: new Date('2026-11-01'),
  cancelAt: null,
  canceledAt: null,
  cancelAtPeriodEnd: false,
  items: [{ id: 'item-sso', price, quantity: 2 }],
};

it.each([
  ['usd', 12_800, '$128.00'],
  ['jpy', 128, '¥128'],
  ['isk', 12_800, 'ISK 128'],
  ['ugx', 12_800, 'UGX 128'],
  ['bhd', 128_000, 'BHD 128.000'],
])('uses the minor currency unit for %s list prices', (currency, unitAmount, expected) => {
  expect(formatUnitPrice({ ...price, currency, unitAmount }, 'en-US')).toBe(expected);
});
it('does not turn a missing unit price into zero or a subscription quantity into an invoice total', () => {
  expect(formatUnitPrice({ ...price, unitAmount: null }, 'en-US')).toBe('—');
  expect(formatUnitPrice({ ...price, unitAmount: 0 }, 'en-US')).toBe('$0.00');
  expect(formatUnitPrice(subscription.items[0]!.price, 'en-US')).toBe('$128.00');
});
it('localizes recurring intervals and handles absent recurring fields', () => {
  expect(formatPriceInterval(price, 'en-US')).toBe('month');
  expect(formatPriceInterval({ ...price, intervalCount: 3 }, 'en-US')).toBe('3 months');
  expect(formatPriceInterval({ ...price, interval: null }, 'en-US')).toBeUndefined();
});
it('uses effective scheduled cancellation instead of Stripe’s request timestamp', () => {
  expect(
    getScheduledCancellation({
      ...subscription,
      cancelAtPeriodEnd: true,
      canceledAt: new Date('2026-10-15'),
    })
  ).toEqual(subscription.currentPeriodEnd);
  const cancelAt = new Date('2026-10-25');
  expect(getScheduledCancellation({ ...subscription, cancelAt })).toBe(cancelAt);
  expect(getScheduledCancellation(subscription)).toBeNull();
  expect(getScheduledCancellation({ ...subscription, status: 'canceled', cancelAt })).toBe(false);
});
