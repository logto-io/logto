import { formatInvoicePeriod } from './subscription';

// `@withtyped/client` is ESM-only and jest's CommonJS resolver cannot find it, hence virtual.
jest.mock('@withtyped/client', () => ({ ResponseError: jest.fn() }), { virtual: true });
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ tryReadResponseErrorBody: jest.fn() }));

describe('formatInvoicePeriod', () => {
  const periodStart = new Date(2026, 7, 15);
  const periodEnd = new Date(2026, 8, 15);

  it('prefers the service period', () => {
    expect(
      formatInvoicePeriod({
        periodStart,
        periodEnd,
        servicePeriodStart: new Date(2026, 8, 1),
        servicePeriodEnd: new Date(2026, 9, 1),
      })
    ).toBe('Sep 1, 2026 - Oct 1, 2026');
  });

  it('falls back to the header period when the service period is null', () => {
    expect(
      formatInvoicePeriod({
        periodStart,
        periodEnd,
        servicePeriodStart: null,
        servicePeriodEnd: null,
      })
    ).toBe('Aug 15, 2026 - Sep 15, 2026');
  });
});
