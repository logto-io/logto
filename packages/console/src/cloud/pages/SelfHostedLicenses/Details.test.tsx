/* eslint-disable max-lines -- Keep key issuance and subscription tests with their shared mocks. */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResponseError } from '@withtyped/client';
import ReactModal from 'react-modal';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import Details from './Details';

jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false } }),
}));

// Jest's CommonJS resolver needs a virtual module for the ESM-only client package.
jest.mock(
  '@withtyped/client',
  () => ({
    ResponseError: class extends Error {
      constructor(readonly response: Response) {
        super('Response error');
      }
    },
  }),
  { virtual: true }
);
// Account-level licenses do not use tenant subscription badges or their Cloud SDK dependencies.
jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
// The alias mapper resolves this stylesheet before Jest's generic CSS mapper.
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: jest.fn(),
  toastResponseError: jest.fn(),
  tryReadResponseErrorBody: async (error: ResponseError) => error.response.clone().json(),
}));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/hooks/use-theme', () => ({
  __esModule: true,
  default: () => 'light',
}));

const summary = {
  id: 'license-a',
  plan: 'self-hosted-pro',
  status: 'active',
  subscriptionStatus: 'active',
  cancelAtPeriodEnd: false,
  currentPeriodEnd: '2027-10-10T00:00:00.000Z',
  lastRefreshedAt: null,
  keyUnavailableReason: null,
  deployments: [],
  usageWarnings: [],
};
const pair = {
  productionKey: 'fixture-production-not-a-credential',
  nonProductionKey: 'fixture-non-production-not-a-credential',
};
const deferredKeys = () => {
  // eslint-disable-next-line @silverhand/fp/no-let -- Control the response to exercise pending issuance.
  let resolveKeys: (keys: typeof pair) => void;
  const promise = new Promise<typeof pair>((resolve) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Capture the resolver for the pending request.
    resolveKeys = resolve;
  });
  return {
    promise,
    resolve: () => {
      resolveKeys(pair);
    },
  };
};
const read = jest.fn();
const issue = jest.fn();
const cancelSubscription = jest.fn();
const api = {
  get: jest.fn(async (_path: string, { params }: { params: { id: string } }) => read(params.id)),
  post: jest.fn(async () => issue()),
  delete: jest.fn(async () => cancelSubscription()),
};
const issueButton = () =>
  screen.getByRole('button', { name: 'admin_console.cloud.self_hosted_licenses.issue_keys' });

const renderDetails = () => {
  const config = {
    provider: () => new Map(),
    dedupingInterval: 0,
    focusThrottleInterval: 0,
    shouldRetryOnError: false,
  };
  const page = (id: string) => (
    <MemoryRouter>
      <SWRConfig value={config}>
        <Details id={id} />
      </SWRConfig>
    </MemoryRouter>
  );
  const result = render(page('license-a'));
  ReactModal.setAppElement(result.container);
  return {
    ...result,
    showLicense: (id: string) => {
      result.rerender(page(id));
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue(api as unknown as ReturnType<typeof useCloudApi>);
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
  read.mockImplementation(async (id: string) => ({ ...summary, id }));
  issue.mockResolvedValue(pair);
  cancelSubscription.mockResolvedValue({ ...summary, cancelAtPeriodEnd: true });
});

it('issues one required pair only on an explicit click, independently of metadata reads', async () => {
  const { promise, resolve } = deferredKeys();
  issue.mockReturnValue(promise);
  renderDetails();
  await screen.findByText('license-a');
  expect(api.post).not.toHaveBeenCalled();

  fireEvent.click(issueButton());
  fireEvent.click(issueButton());
  expect(issueButton().hasAttribute('disabled')).toBe(true);
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith('/api/me/self-hosted-licenses/:id/keys', {
    params: { id: 'license-a' },
  });
  expect(screen.getByText('license-a')).toBeTruthy();

  await act(async () => {
    resolve();
  });
  expect(screen.getByText('admin_console.cloud.self_hosted_licenses.production_key')).toBeTruthy();
  expect(
    screen.getByText('admin_console.cloud.self_hosted_licenses.non_production_key')
  ).toBeTruthy();
  expect(screen.queryByText(pair.productionKey)).toBeNull();
  expect(screen.queryByText(pair.nonProductionKey)).toBeNull();

  const readsBeforeFocus = read.mock.calls.length;
  fireEvent.focus(window);
  await waitFor(() => {
    expect(read.mock.calls.length).toBeGreaterThan(readsBeforeFocus);
  });
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(screen.getByText('admin_console.cloud.self_hosted_licenses.production_key')).toBeTruthy();
});

it('retries metadata without issuing keys', async () => {
  read.mockRejectedValueOnce(new Error('Metadata unavailable'));
  renderDetails();
  await screen.findByText('admin_console.cloud.self_hosted_licenses.load_error');
  fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.retry' }));
  expect(await screen.findByText('license-a')).toBeTruthy();
  expect(issueButton()).toBeTruthy();
  expect(api.post).not.toHaveBeenCalled();
});

it('keeps metadata on signing failure and retries issuance only on another click', async () => {
  issue.mockRejectedValueOnce(new Error('Signing unavailable'));
  renderDetails();
  await screen.findByText('license-a');
  fireEvent.click(issueButton());
  expect(
    await screen.findByText('admin_console.cloud.self_hosted_licenses.issue_error')
  ).toBeTruthy();
  expect(screen.getByText('license-a')).toBeTruthy();
  expect(screen.queryByText('admin_console.cloud.self_hosted_licenses.load_error')).toBeNull();
  const readsBeforeFocus = read.mock.calls.length;
  fireEvent.focus(window);
  await waitFor(() => {
    expect(read.mock.calls.length).toBeGreaterThan(readsBeforeFocus);
  });
  expect(api.post).toHaveBeenCalledTimes(1);

  fireEvent.click(issueButton());
  expect(
    await screen.findByText('admin_console.cloud.self_hosted_licenses.production_key')
  ).toBeTruthy();
  expect(api.post).toHaveBeenCalledTimes(2);
});

it('keeps metadata and stops offering issuance when the typed client returns 403', async () => {
  issue.mockRejectedValueOnce(new ResponseError({ status: 403 } as Response));
  renderDetails();
  await screen.findByText('license-a');
  fireEvent.click(issueButton());
  expect(
    await screen.findByText('admin_console.cloud.self_hosted_licenses.keys_unavailable')
  ).toBeTruthy();
  expect(screen.getByText('license-a')).toBeTruthy();
  expect(screen.queryByText('admin_console.cloud.self_hosted_licenses.issue_error')).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'admin_console.cloud.self_hosted_licenses.issue_keys' })
  ).toBeNull();
});

it('does not expose an incomplete key pair', async () => {
  issue.mockResolvedValueOnce({ productionKey: pair.productionKey });
  renderDetails();
  await screen.findByText('license-a');
  fireEvent.click(issueButton());
  expect(
    await screen.findByText('admin_console.cloud.self_hosted_licenses.issue_error')
  ).toBeTruthy();
  expect(screen.queryByText('admin_console.cloud.self_hosted_licenses.production_key')).toBeNull();
  expect(screen.queryByText(pair.productionKey)).toBeNull();
});

it.each(['account', 'license'])(
  'discards a pending key response when the %s changes',
  async (scope) => {
    const { promise, resolve } = deferredKeys();
    issue.mockReturnValue(promise);
    const { showLicense } = renderDetails();
    await screen.findByText('license-a');
    fireEvent.click(issueButton());

    if (scope === 'account') {
      jest
        .mocked(useCurrentUser)
        .mockReturnValue({ user: { id: 'bob' } } as ReturnType<typeof useCurrentUser>);
    }
    showLicense(scope === 'license' ? 'license-b' : 'license-a');
    await waitFor(() => {
      expect(issueButton().hasAttribute('disabled')).toBe(false);
    });
    await act(async () => {
      resolve();
    });
    expect(
      screen.queryByText('admin_console.cloud.self_hosted_licenses.production_key')
    ).toBeNull();
    expect(issueButton()).toBeTruthy();
    expect(api.post).toHaveBeenCalledTimes(1);
  }
);

it('shows the deployments, their latest usage, and the current usage warnings', async () => {
  read.mockResolvedValue({
    ...summary,
    deployments: [
      {
        deploymentId: 'deployment-reporting',
        env: 'production',
        logtoVersion: '1.40.0',
        firstSeenAt: '2026-10-01T00:00:00.000Z',
        lastSeenAt: '2026-10-20T00:00:00.000Z',
        active: true,
        usage: {
          month: '2026-10',
          // The table shows the value limits are evaluated against: the higher of the two months.
          mau: { lastMonth: 61_000, monthToDate: 12_000 },
          monthlyAccessTokens: { lastMonth: 1000, monthToDate: 2500 },
          tenants: 3,
          reportedAt: '2026-10-20T00:00:00.000Z',
        },
      },
      {
        deploymentId: 'deployment-silent',
        env: 'non-production',
        logtoVersion: '1.30.0',
        firstSeenAt: '2026-10-01T00:00:00.000Z',
        lastSeenAt: '2026-10-02T00:00:00.000Z',
        active: false,
        usage: null,
      },
    ],
    usageWarnings: [{ env: 'production', metric: 'mau', limit: 50_000, value: 61_000 }],
  });
  renderDetails();

  const reporting = await screen.findByRole('row', { name: /deployment-reporting/ });
  expect(reporting.textContent).toContain('1.40.0');
  expect(reporting.textContent).toContain('61,000');
  expect(reporting.textContent).toContain('2,500');
  expect(reporting.textContent).not.toContain('12,000');
  expect(reporting.textContent).not.toContain('self_hosted_licenses.inactive');
  const silent = screen.getByRole('row', { name: /deployment-silent/ });
  expect(silent.textContent).toContain('—');
  expect(silent.textContent).toContain('self_hosted_licenses.inactive');
  expect(
    screen.getByText('admin_console.cloud.self_hosted_licenses.usage_warning_description')
  ).toBeTruthy();
  expect(
    screen.getByText('admin_console.cloud.self_hosted_licenses.usage_warning_metric')
  ).toBeTruthy();
});

it('shows no usage warning and an empty deployment list for a license never refreshed', async () => {
  renderDetails();
  expect(
    await screen.findByText('admin_console.cloud.self_hosted_licenses.deployments_empty')
  ).toBeTruthy();
  expect(
    screen.queryByText('admin_console.cloud.self_hosted_licenses.usage_warning_description')
  ).toBeNull();
});

it('keeps the license page working when Cloud returns no usage fields', async () => {
  read.mockResolvedValue({ ...summary, deployments: undefined, usageWarnings: undefined });
  renderDetails();
  expect(
    await screen.findByText('admin_console.cloud.self_hosted_licenses.deployments_empty')
  ).toBeTruthy();
  expect(issueButton()).toBeTruthy();
});

const cancelError = (status: number, code: string, retryable: boolean) =>
  new ResponseError({
    status,
    clone: () => ({
      json: async () => ({ message: 'Cancellation failed.', error: { code, retryable } }),
    }),
  } as unknown as Response);

const openCancelConfirmation = async () => {
  await screen.findByText('license-a');
  const more = document.querySelector('.actionMenuButton');
  if (!more) {
    throw new Error('The action menu is not rendered.');
  }
  fireEvent.click(more);
  fireEvent.click(
    await screen.findByText('admin_console.cloud.self_hosted_licenses.cancel.action')
  );
  await screen.findByText('admin_console.cloud.self_hosted_licenses.cancel.confirm_content');
};

const confirmButton = () =>
  screen.getByRole('button', { name: 'admin_console.cloud.self_hosted_licenses.cancel.action' });

describe('cancel subscription', () => {
  it('cancels only after confirmation, then shows the license canceling at period end', async () => {
    renderDetails();
    await openCancelConfirmation();
    expect(api.delete).not.toHaveBeenCalled();

    read.mockImplementation(async (id: string) => ({ ...summary, id, cancelAtPeriodEnd: true }));
    fireEvent.click(confirmButton());

    expect(
      await screen.findByText('admin_console.cloud.self_hosted_licenses.status.canceling')
    ).toBeTruthy();
    expect(api.delete).toHaveBeenCalledTimes(1);
    expect(api.delete).toHaveBeenCalledWith('/api/me/self-hosted-licenses/:id/subscription', {
      params: { id: 'license-a' },
    });
  });

  it('sends nothing when the confirmation is dismissed', async () => {
    renderDetails();
    await openCancelConfirmation();
    fireEvent.click(
      screen.getByRole('button', { name: 'admin_console.cloud.self_hosted_licenses.cancel.keep' })
    );
    await waitFor(() => {
      expect(
        screen.queryByText('admin_console.cloud.self_hosted_licenses.cancel.confirm_content')
      ).toBeNull();
    });
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('asks to pay the outstanding invoice, without a retry, when payment is required', async () => {
    cancelSubscription.mockRejectedValueOnce(
      cancelError(409, 'self_hosted_license.subscription_payment_required', false)
    );
    renderDetails();
    await openCancelConfirmation();
    fireEvent.click(confirmButton());

    expect(
      await screen.findByText('admin_console.cloud.self_hosted_licenses.cancel.payment_required')
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'admin_console.general.retry' })).toBeNull();
  });

  it('offers a retry when Stripe did not apply the cancellation', async () => {
    cancelSubscription.mockRejectedValueOnce(
      cancelError(502, 'self_hosted_license.subscription_cancellation_failed', true)
    );
    renderDetails();
    await openCancelConfirmation();
    fireEvent.click(confirmButton());

    expect(
      await screen.findByText('admin_console.cloud.self_hosted_licenses.cancel.failed')
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.retry' }));
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(
        screen.queryByText('admin_console.cloud.self_hosted_licenses.cancel.failed')
      ).toBeNull();
    });
  });

  it('is not offered for a subscription already canceling', async () => {
    read.mockImplementation(async (id: string) => ({ ...summary, id, cancelAtPeriodEnd: true }));
    renderDetails();
    await screen.findByText('license-a');
    expect(document.querySelector('.actionMenuButton')).toBeNull();
  });
});

describe('status and key availability', () => {
  it.each([
    ['past_due', 'unpaid', 'past_due', 'keys_payment_required'],
    ['unpaid', 'unpaid', 'unpaid', 'keys_payment_required'],
    ['canceled', 'canceled', 'canceled', 'keys_unavailable'],
  ])(
    'shows a %s subscription refused as %s with the %s tag and the %s message',
    async (subscriptionStatus, keyUnavailableReason, tag, message) => {
      read.mockResolvedValue({ ...summary, subscriptionStatus, keyUnavailableReason });
      renderDetails();

      expect(
        await screen.findByText(`admin_console.cloud.self_hosted_licenses.status.${tag}`)
      ).toBeTruthy();
      expect(screen.getByText(`admin_console.cloud.self_hosted_licenses.${message}`)).toBeTruthy();
      expect(
        screen.queryByRole('button', {
          name: 'admin_console.cloud.self_hosted_licenses.issue_keys',
        })
      ).toBeNull();
    }
  );

  it('shows a license waiting for its payment webhook as activating, not expired', async () => {
    read.mockResolvedValue({
      ...summary,
      status: 'pending',
      subscriptionStatus: null,
      currentPeriodEnd: null,
      keyUnavailableReason: 'expired',
    });
    renderDetails();

    expect(
      await screen.findByText('admin_console.cloud.self_hosted_licenses.status.pending')
    ).toBeTruthy();
    expect(screen.getByText('admin_console.cloud.self_hosted_licenses.keys_pending')).toBeTruthy();
    expect(
      screen.queryByText('admin_console.cloud.self_hosted_licenses.status.expired')
    ).toBeNull();
  });
});
/* eslint-enable max-lines */
