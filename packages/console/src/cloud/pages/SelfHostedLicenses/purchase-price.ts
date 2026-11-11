import { type SelfHostedLicensePrice } from '@/cloud/types/router';

/**
 * The yearly price as a monthly amount, as the self-hosted plans page shows it ("$249/mo, billed
 * annually"). A whole amount drops its decimals.
 */
export const formatMonthlyPrice = (
  { unitAmount, currency }: Pick<SelfHostedLicensePrice, 'unitAmount' | 'currency'>,
  locale: string
) => {
  const options = { style: 'currency', currency } as const;
  // Stripe retains two-decimal API amounts for ISK/UGX despite their zero-decimal display.
  // https://docs.stripe.com/currencies#special-cases
  const digits = ['isk', 'ugx'].includes(currency.toLowerCase())
    ? 2
    : (new Intl.NumberFormat(locale, options).resolvedOptions().maximumFractionDigits ?? 2);
  const amount = unitAmount / 12 / 10 ** digits;

  return new Intl.NumberFormat(locale, {
    ...options,
    ...(Number.isInteger(amount) && { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  }).format(amount);
};
