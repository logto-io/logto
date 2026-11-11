import { formatMonthlyPrice } from './purchase-price';

describe('formatMonthlyPrice', () => {
  it('shows a whole monthly amount without decimals', () => {
    expect(formatMonthlyPrice({ unitAmount: 298_800, currency: 'usd' }, 'en')).toBe('$249');
  });

  it('keeps the decimals of an amount that is not whole', () => {
    expect(formatMonthlyPrice({ unitAmount: 100_000, currency: 'usd' }, 'en')).toBe('$83.33');
  });

  it('reads zero-decimal currencies in their own unit', () => {
    expect(formatMonthlyPrice({ unitAmount: 36_000, currency: 'jpy' }, 'en')).toBe('¥3,000');
  });
});
