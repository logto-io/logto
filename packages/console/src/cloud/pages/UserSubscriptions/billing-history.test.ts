import phrases from '@logto/phrases';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import i18next from 'i18next';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import {
  useEnterpriseInvoices,
  useUserSubscriptionInvoices,
} from '@/cloud/hooks/use-user-subscriptions';

import BillingHistory from './BillingHistory';

jest.mock(
  '@withtyped/client',
  () => ({
    ResponseError: class extends Error {
      constructor(readonly response: { status: number }) {
        super(`Request failed with ${response.status}`);
      }
    },
  }),
  { virtual: true }
);
jest.mock('@/ds-components/Tip', () => ({
  ToggleTip: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/components/Region', () => ({
  __esModule: true,
  defaultRegionName: 'EU',
  default: () => null,
}));
jest.mock('@/consts/env', () => ({
  isCloud: true,
  isDevFeaturesEnabled: true,
  adminEndpoint: 'https://cloud.example.com',
}));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false } }),
}));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: jest.fn() }));
jest.mock('@/cloud/hooks/use-user-subscriptions', () => ({
  useUserSubscriptionInvoices: jest.fn(),
  useEnterpriseInvoices: jest.fn(),
}));

const { ResponseError } = jest.requireMock<{
  ResponseError: new (response: { status: number }) => Error;
}>('@withtyped/client');
const get = jest.fn();
const mutatePersonal = jest.fn();
const mutateEnterprise = jest.fn();
const invoice = {
  id: 'in_sso',
  product: 'console-sso',
  subscriptionId: 'sub-sso',
  status: 'paid',
  createdAt: new Date('2026-10-01T12:00:00Z'),
  periodStart: new Date('2026-09-01T12:00:00Z'),
  periodEnd: new Date('2026-10-01T12:00:00Z'),
  servicePeriodStart: new Date('2026-10-01T12:00:00Z'),
  servicePeriodEnd: new Date('2026-11-01T12:00:00Z'),
  amountDue: 25_600,
  amountPaid: 25_600,
  currency: 'usd',
};
const enterpriseInvoice = {
  ...invoice,
  id: 'in_enterprise',
  amountDue: 1_000_000,
  amountPaid: 1_000_000,
};

const mockPersonal = (
  invoices: unknown[] | undefined,
  { totalCount = invoices?.length ?? 0, error }: { totalCount?: number; error?: Error } = {}
) => {
  jest.mocked(useUserSubscriptionInvoices).mockReturnValue({
    data: invoices && { invoices, totalCount },
    error,
    isLoading: false,
    mutate: mutatePersonal,
  } as unknown as ReturnType<typeof useUserSubscriptionInvoices>);
};
const mockEnterprise = (invoices: unknown[] | undefined, error?: Error) => {
  jest.mocked(useEnterpriseInvoices).mockReturnValue({
    data: invoices,
    error,
    isLoading: false,
    mutate: mutateEnterprise,
  } as unknown as ReturnType<typeof useEnterpriseInvoices>);
};
const renderHistory = (enterprise?: { id: string }) =>
  render(
    createElement(
      MemoryRouter,
      { future: { v7_startTransition: true, v7_relativeSplatPath: true } },
      createElement(BillingHistory, { enterprise })
    )
  );
const getRow = (text: string) => screen.getByText(text).closest('tr')!;

beforeAll(() => {
  i18next.addResourceBundle('en', 'translation', phrases.en.translation, true, true);
});
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue({ get } as unknown as ReturnType<typeof useCloudApi>);
  jest.spyOn(window, 'open').mockReturnValue(null);
  mockPersonal([]);
  mockEnterprise([]);
});
afterEach(() => {
  jest.restoreAllMocks();
});

it('shows Enterprise and personal invoices in separate authorized lists', () => {
  mockPersonal([invoice]);
  mockEnterprise([enterpriseInvoice]);
  renderHistory({ id: 'contract' });
  expect(jest.mocked(useEnterpriseInvoices)).toHaveBeenCalledWith('contract');
  expect(screen.getByText('Enterprise Plan')).toBeTruthy();
  expect(within(getRow('$10,000.00')).queryByText('Console SSO')).toBeNull();
  expect(within(getRow('$256.00')).getByText('Console SSO')).toBeTruthy();
  expect(within(getRow('$256.00')).getByText('Oct 1, 2026 - Nov 1, 2026')).toBeTruthy();
  expect(within(getRow('$256.00')).getByText('Paid')).toBeTruthy();
});

it('shows personal invoices only when the user has no Enterprise', () => {
  mockPersonal([invoice]);
  renderHistory();
  expect(jest.mocked(useEnterpriseInvoices)).toHaveBeenCalledWith(undefined);
  expect(screen.queryByText('Enterprise Plan')).toBeNull();
  expect(screen.getByText('$256.00')).toBeTruthy();
});

it('shows Enterprise invoices with empty personal history', () => {
  mockEnterprise([enterpriseInvoice]);
  renderHistory({ id: 'contract' });
  expect(screen.getByText('$10,000.00')).toBeTruthy();
  expect(screen.getAllByText('No data')).toHaveLength(1);
});

it('preserves zero, credit, corrected and unknown-product invoices at the invoice level', () => {
  mockPersonal([
    { ...invoice, id: 'in_zero', amountDue: 0, amountPaid: 0 },
    { ...invoice, id: 'in_void', status: 'void', amountDue: 12_800, currency: 'eur' },
    { ...invoice, id: 'in_overdue', status: 'uncollectible', amountDue: 50_000, currency: 'jpy' },
    { ...invoice, id: 'in_unknown', product: null, amountDue: 4200, currency: null },
  ]);
  renderHistory();
  expect(within(getRow('$0.00')).getByText('Paid')).toBeTruthy();
  expect(within(getRow('€128.00')).getByText('Canceled')).toBeTruthy();
  expect(within(getRow('¥50,000')).getByText('Overdue')).toBeTruthy();
  expect(within(getRow('42.00')).getByText('Other subscription')).toBeTruthy();
  expect(screen.getByText(/not necessarily refunded to your payment method/)).toBeTruthy();
});

it('pages personal invoices with the API total', () => {
  mockPersonal([invoice], { totalCount: 25 });
  renderHistory();
  expect(jest.mocked(useUserSubscriptionInvoices)).toHaveBeenLastCalledWith(1, 10);
  fireEvent.click(screen.getByText('2'));
  expect(jest.mocked(useUserSubscriptionInvoices)).toHaveBeenLastCalledWith(2, 10);
});

it('shows list failures instead of empty history and retries each list', () => {
  mockPersonal(undefined, { error: new Error('Personal invoices unavailable') });
  mockEnterprise(undefined, new Error('Enterprise not found'));
  renderHistory({ id: 'foreign' });
  expect(screen.queryByText('No data')).toBeNull();
  expect(screen.getByText('Personal invoices unavailable')).toBeTruthy();
  expect(screen.getByText('Enterprise not found')).toBeTruthy();
  for (const button of screen.getAllByRole('button', { name: 'Try again' })) {
    fireEvent.click(button);
  }
  expect(mutatePersonal).toHaveBeenCalled();
  expect(mutateEnterprise).toHaveBeenCalled();
});

it('opens a freshly read invoice link for each list', async () => {
  mockPersonal([invoice]);
  mockEnterprise([enterpriseInvoice]);
  get.mockResolvedValue({ hostedInvoiceUrl: 'https://invoice.stripe.com/i/fresh' });
  renderHistory({ id: 'contract' });
  fireEvent.click(screen.getByText('$256.00'));
  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('https://invoice.stripe.com/i/fresh', '_blank');
  });
  expect(get).toHaveBeenCalledWith('/api/me/subscriptions/invoices/:invoiceId/hosted-invoice-url', {
    params: { invoiceId: 'in_sso' },
  });
  fireEvent.click(screen.getByText('$10,000.00'));
  await waitFor(() => {
    expect(get).toHaveBeenCalledWith(
      '/api/me/logto-enterprises/:enterpriseId/invoices/:invoiceId/hosted-invoice-url',
      { params: { enterpriseId: 'contract', invoiceId: 'in_enterprise' } }
    );
  });
});

it('distinguishes an unavailable invoice link from a retryable failure', async () => {
  mockPersonal([invoice]);
  get.mockRejectedValueOnce(new ResponseError({ status: 404 }));
  renderHistory();
  fireEvent.click(screen.getByText('$256.00'));
  await waitFor(() => {
    expect(screen.getByText(/This invoice page is unavailable/)).toBeTruthy();
  });
  expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();

  get
    .mockRejectedValueOnce(new ResponseError({ status: 503 }))
    .mockResolvedValueOnce({ hostedInvoiceUrl: 'https://invoice.stripe.com/i/retried' });
  fireEvent.click(screen.getByText('$256.00'));
  await waitFor(() => {
    expect(screen.getByText('Request failed with 503')).toBeTruthy();
  });
  expect(screen.queryByText(/This invoice page is unavailable/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('https://invoice.stripe.com/i/retried', '_blank');
  });
  expect(screen.queryByText('Request failed with 503')).toBeNull();
});
