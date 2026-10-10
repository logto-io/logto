import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { useStaticApi } from '@/hooks/use-api';
import useCurrentUser from '@/hooks/use-current-user';

import Details from './Details';

jest.mock('@/hooks/use-api', () => ({ useStaticApi: jest.fn() }));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));

const summary = {
  id: 'license-a',
  plan: 'self-hosted-pro',
  status: 'active',
  subscriptionStatus: 'active',
  cancelAtPeriodEnd: false,
  currentPeriodEnd: '2027-10-10T00:00:00.000Z',
  lastRefreshedAt: null,
  keyUnavailableReason: null,
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
const api = {
  get: jest.fn((path: string) => ({ json: async () => read(path) })),
  post: jest.fn(() => ({ json: async () => issue() })),
};
const issueButton = () =>
  screen.getByRole('button', { name: 'cloud.self_hosted_licenses.issue_keys' });

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
  return {
    ...result,
    showLicense: (id: string) => {
      result.rerender(page(id));
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useStaticApi).mockReturnValue(api as unknown as ReturnType<typeof useStaticApi>);
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
  read.mockImplementation(async (path: string) => ({ ...summary, id: path.split('/').at(-1) }));
  issue.mockResolvedValue(pair);
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
  expect(api.post).toHaveBeenCalledWith('/api/me/self-hosted-licenses/license-a/keys', {
    retry: 0,
    cache: 'no-store',
  });
  expect(screen.getByText('license-a')).toBeTruthy();

  await act(async () => {
    resolve();
  });
  expect(screen.getByText('cloud.self_hosted_licenses.production_key')).toBeTruthy();
  expect(screen.getByText('cloud.self_hosted_licenses.non_production_key')).toBeTruthy();
  expect(screen.queryByText(pair.productionKey)).toBeNull();
  expect(screen.queryByText(pair.nonProductionKey)).toBeNull();

  const readsBeforeFocus = read.mock.calls.length;
  fireEvent.focus(window);
  await waitFor(() => {
    expect(read.mock.calls.length).toBeGreaterThan(readsBeforeFocus);
  });
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(screen.getByText('cloud.self_hosted_licenses.production_key')).toBeTruthy();
});

it('retries metadata without issuing keys', async () => {
  read.mockRejectedValueOnce(new Error('Metadata unavailable'));
  renderDetails();
  await screen.findByText('cloud.self_hosted_licenses.load_error');
  fireEvent.click(screen.getByRole('button', { name: 'general.retry' }));
  expect(await screen.findByText('license-a')).toBeTruthy();
  expect(issueButton()).toBeTruthy();
  expect(api.post).not.toHaveBeenCalled();
});

it('keeps metadata on signing failure and retries issuance only on another click', async () => {
  issue.mockRejectedValueOnce(new Error('Signing unavailable'));
  renderDetails();
  await screen.findByText('license-a');
  fireEvent.click(issueButton());
  expect(await screen.findByText('cloud.self_hosted_licenses.issue_error')).toBeTruthy();
  expect(screen.getByText('license-a')).toBeTruthy();
  expect(screen.queryByText('cloud.self_hosted_licenses.load_error')).toBeNull();
  const readsBeforeFocus = read.mock.calls.length;
  fireEvent.focus(window);
  await waitFor(() => {
    expect(read.mock.calls.length).toBeGreaterThan(readsBeforeFocus);
  });
  expect(api.post).toHaveBeenCalledTimes(1);

  fireEvent.click(issueButton());
  expect(await screen.findByText('cloud.self_hosted_licenses.production_key')).toBeTruthy();
  expect(api.post).toHaveBeenCalledTimes(2);
});

it('does not expose an incomplete key pair', async () => {
  issue.mockResolvedValueOnce({ productionKey: pair.productionKey });
  renderDetails();
  await screen.findByText('license-a');
  fireEvent.click(issueButton());
  expect(await screen.findByText('cloud.self_hosted_licenses.issue_error')).toBeTruthy();
  expect(screen.queryByText('cloud.self_hosted_licenses.production_key')).toBeNull();
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
    expect(screen.queryByText('cloud.self_hosted_licenses.production_key')).toBeNull();
    expect(issueButton()).toBeTruthy();
    expect(api.post).toHaveBeenCalledTimes(1);
  }
);
