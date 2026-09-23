import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { ResponseError } from '@withtyped/client';
import { createElement } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector, type ConsoleSsoDomain } from '@/cloud/types/router';
import useCurrentUser from '@/hooks/use-current-user';

import DomainManager from './index';
import {
  getDomains,
  getPollDelay,
  normalizeDomain,
  readDomainError,
  useDomainManager,
} from './use-domain-manager';

function mockRenderTable({
  rowGroups,
  columns,
}: {
  rowGroups: Array<{ data: Array<{ type: string; name: string; value: string }> }>;
  columns: Array<{
    render: (record: { type: string; name: string; value: string }) => React.ReactNode;
  }>;
}) {
  const { Children } = jest.requireActual<{
    Children: { toArray: (children: React.ReactNode) => React.ReactNode[] };
  }>('react');
  return Children.toArray(
    rowGroups.flatMap(({ data }) =>
      data.flatMap((record) => columns.map(({ render }) => render(record)))
    )
  );
}

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
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: jest.fn(),
  toastResponseError: jest.fn(),
}));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/consts/env', () => ({ isCloud: true }));
jest.mock('@/hooks/use-tenant-pathname', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/scss/modal.module.scss', () => ({}), { virtual: true });
jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/ds-components/Table', () => ({ __esModule: true, default: mockRenderTable }));
jest.mock('@/hooks/use-confirm-modal', () => ({
  useConfirmModal: () => ({ show: jest.fn(async () => [false]) }),
}));

const pending: ConsoleSsoDomain = {
  domain: 'example.com',
  isBound: false,
  verificationToken: 'stable-token',
  verifiedAt: null,
  lastCheckedAt: null,
  dnsRecords: [{ type: 'TXT', name: '_logto-cloud-sso.example.com', value: 'stable-token' }],
};
const bound: ConsoleSsoDomain = { domain: 'example.com', isBound: true };
const connector = {
  id: 'cloud-relation',
  boundDomains: [],
  domainVerifications: [],
} as unknown as ConsoleSsoConnector;

const api = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};
const onUpdated = jest.fn(async () => {
  await Promise.resolve();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue(api as unknown as ReturnType<typeof useCloudApi>);
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
});

afterEach(() => {
  jest.useRealTimers();
});

it('normalizes domain identity like Cloud and prefers bound state after proof cleanup', () => {
  expect(normalizeDomain(' EXAMPLE.COM. ')).toBe('example.com');
  expect(getDomains({ ...connector, boundDomains: ['example.com'] })).toEqual([bound]);
  expect(
    getDomains({
      ...connector,
      boundDomains: ['example.com'],
      domainVerifications: [
        {
          domain: 'example.com',
          verificationToken: 'stable-token',
          verifiedAt: null,
          lastCheckedAt: null,
          dnsRecords: pending.dnsRecords,
        },
      ],
    })
  ).toEqual([bound]);
});

it('adds or resumes a challenge without writing the free-form connector domain field', async () => {
  api.post.mockResolvedValue(pending);
  const { result } = renderHook(() => useDomainManager({ data: connector, onUpdated }));

  act(() => {
    result.current.setInput(' EXAMPLE.COM. ');
  });
  await act(async () => {
    await result.current.add();
  });

  expect(api.post).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId/domains', {
    params: { connectorId: 'cloud-relation' },
    body: { domain: 'example.com' },
  });
  expect(result.current.domains).toEqual([pending]);
  expect(result.current.expanded).toBe('example.com');
});

it('uses POST only for verification, and keeps GET refresh read-only', async () => {
  api.get.mockResolvedValue(pending);
  api.post.mockResolvedValue(bound);
  const data = { ...connector, domainVerifications: [pending] };
  const { result } = renderHook(() => useDomainManager({ data, onUpdated }));

  act(() => {
    result.current.toggle('example.com');
  });
  await act(async () => {
    await Promise.resolve();
  });
  expect(api.get).toHaveBeenCalledWith(
    '/api/me/console-sso/connectors/:connectorId/domains/:domain',
    { params: { connectorId: 'cloud-relation', domain: 'example.com' } }
  );
  expect(api.post).not.toHaveBeenCalled();

  await act(async () => {
    await result.current.verify('example.com');
  });
  expect(api.post).toHaveBeenCalledWith(
    '/api/me/console-sso/connectors/:connectorId/domains/:domain/verify',
    { params: { connectorId: 'cloud-relation', domain: 'example.com' } }
  );
  expect(result.current.domains).toEqual([bound]);
});

it('waits at least 10 seconds between checks and does not overlap manual verification', async () => {
  jest.useFakeTimers();
  const now = Date.now();
  expect(getPollDelay(now)).toBe(10_000);
  api.get.mockResolvedValue(pending);
  // eslint-disable-next-line @silverhand/fp/no-let -- Hold the verification response to exercise concurrent timer and manual actions.
  let completeVerification: (status: ConsoleSsoDomain) => void;
  api.post.mockImplementation(
    async () =>
      new Promise<ConsoleSsoDomain>((resolve) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation -- Capture the deferred test resolver.
        completeVerification = resolve;
      })
  );
  const data = { ...connector, domainVerifications: [pending] };
  const { result } = renderHook(() => useDomainManager({ data, onUpdated }));
  act(() => {
    result.current.toggle('example.com');
  });
  await act(async () => {
    await Promise.resolve();
  });

  await act(async () => {
    jest.advanceTimersByTime(10_000);
    await Promise.resolve();
  });
  expect(api.post).toHaveBeenCalledTimes(1);
  await act(async () => {
    await result.current.verify('example.com');
  });
  expect(api.post).toHaveBeenCalledTimes(1);
  await act(async () => {
    completeVerification(bound);
    await Promise.resolve();
  });
  expect(result.current.domains).toEqual([bound]);
  act(() => {
    jest.advanceTimersByTime(20_000);
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});

it('ignores a late verification after removal and starts a fresh challenge on re-add', async () => {
  // eslint-disable-next-line @silverhand/fp/no-let -- Hold a server response until after removal.
  let completeVerification: (status: ConsoleSsoDomain) => void;
  api.post.mockImplementationOnce(
    async () =>
      new Promise<ConsoleSsoDomain>((resolve) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation -- Capture the deferred test resolver.
        completeVerification = resolve;
      })
  );
  api.delete.mockResolvedValue(null);
  const data = { ...connector, domainVerifications: [pending] };
  const { result } = renderHook(() => useDomainManager({ data, onUpdated }));

  act(() => {
    void result.current.verify('example.com');
  });
  await act(async () => {
    await result.current.remove('example.com');
  });
  await act(async () => {
    completeVerification(bound);
    await Promise.resolve();
  });
  expect(result.current.domains).toEqual([]);
  expect(api.delete).toHaveBeenCalledWith(
    '/api/me/console-sso/connectors/:connectorId/domains/:domain',
    { params: { connectorId: 'cloud-relation', domain: 'example.com' } }
  );

  const replacement = { ...pending, verificationToken: 'new-token' };
  api.post.mockResolvedValueOnce(replacement);
  act(() => {
    result.current.setInput('example.com');
  });
  await act(async () => {
    await result.current.add();
  });
  expect(result.current.domains).toEqual([replacement]);
});

it('treats DNS failure as retryable polling and provider failure as blocking', async () => {
  const dnsError = new ResponseError({
    status: 502,
    clone: () => ({
      json: async () => ({
        message: 'DNS lookup failed',
        error: { code: 'console_sso.dns_lookup_failed', retryable: true },
      }),
    }),
  } as Response);
  const providerError = new ResponseError({
    status: 400,
    clone: () => ({
      json: async () => ({
        message: 'Configure provider',
        error: { code: 'console_sso.invalid_config', retryable: false },
      }),
    }),
  } as Response);
  expect(await readDomainError(dnsError)).toMatchObject({ blocksPolling: false });
  expect(await readDomainError(providerError)).toMatchObject({ blocksPolling: true });
});

it('preserves proven but unbound status and pauses automatic checks on a provider error', async () => {
  jest.useFakeTimers();
  const providerError = new ResponseError({
    status: 400,
    clone: () => ({
      json: async () => ({
        message: 'Complete provider configuration',
        error: { code: 'console_sso.invalid_config', retryable: false },
      }),
    }),
  } as Response);
  api.post.mockRejectedValue(providerError);
  api.get.mockResolvedValue({ ...pending, verifiedAt: 123 });
  const data = { ...connector, domainVerifications: [pending] };
  const { result } = renderHook(() => useDomainManager({ data, onUpdated }));

  await act(async () => {
    await result.current.verify('example.com');
  });
  expect(result.current.domains[0]).toMatchObject({ isBound: false, verifiedAt: 123 });
  expect(result.current.errors['example.com']).toMatchObject({
    code: 'console_sso.invalid_config',
    blocksPolling: true,
  });
  act(() => {
    result.current.toggle('example.com');
  });
  await act(async () => {
    jest.advanceTimersByTime(30_000);
    await Promise.resolve();
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});

it('stops pending verification polling when the page unmounts', async () => {
  jest.useFakeTimers();
  api.get.mockResolvedValue(pending);
  const data = { ...connector, domainVerifications: [pending] };
  const { result, unmount } = renderHook(() => useDomainManager({ data, onUpdated }));
  act(() => {
    result.current.toggle('example.com');
  });
  await act(async () => {
    await Promise.resolve();
  });
  unmount();
  act(() => {
    jest.advanceTimersByTime(30_000);
  });
  expect(api.post).not.toHaveBeenCalled();
});

it('expands the pending row to show the TXT record and copies its exact value', async () => {
  api.get.mockResolvedValue(pending);
  const writeText = jest.fn(async () => {
    await Promise.resolve();
  });
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Supply the browser clipboard for the copy control.
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  render(
    createElement(DomainManager, {
      data: { ...connector, domainVerifications: [pending] },
      onUpdated,
    })
  );

  const header = screen.getByText('example.com').closest('button');
  if (!header) {
    throw new Error('Domain header not found.');
  }
  expect(header.getAttribute('aria-expanded')).toBe('false');
  await act(async () => {
    fireEvent.click(header);
    await Promise.resolve();
  });
  expect(header.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByText('_logto-cloud-sso.example.com')).not.toBeNull();
  const value = screen.getByText('stable-token');
  const copyButton = value.closest('[role="button"]')?.querySelector('button');
  if (!copyButton) {
    throw new Error('TXT copy control not found.');
  }
  fireEvent.click(copyButton);
  await waitFor(() => {
    expect(writeText).toHaveBeenCalledWith('stable-token');
  });
  expect(header.getAttribute('aria-expanded')).toBe('true');
});

it('expands an already bound domain without inventing a TXT challenge', async () => {
  api.get.mockResolvedValue(bound);
  render(
    createElement(DomainManager, {
      data: { ...connector, boundDomains: ['example.com'] },
      onUpdated,
    })
  );
  const header = screen.getByText('example.com').closest('button');
  if (!header) {
    throw new Error('Domain header not found.');
  }
  await act(async () => {
    fireEvent.click(header);
    await Promise.resolve();
  });
  expect(header.getAttribute('aria-expanded')).toBe('true');
  expect(screen.queryByText('_logto-cloud-sso.example.com')).toBeNull();
  expect(api.post).not.toHaveBeenCalled();
});

it('offers cleanup recovery when Core is bound but its temporary proof remains', async () => {
  api.get.mockResolvedValue(bound);
  api.post.mockResolvedValue(bound);
  render(
    createElement(DomainManager, {
      data: { ...connector, boundDomains: ['example.com'], domainVerifications: [pending] },
      onUpdated,
    })
  );
  const header = screen.getByText('example.com').closest('button');
  if (!header) {
    throw new Error('Domain header not found.');
  }
  await act(async () => {
    fireEvent.click(header);
    await Promise.resolve();
  });
  expect(screen.queryByText('_logto-cloud-sso.example.com')).toBeNull();
  expect(screen.getByText('admin_console.cloud.console_sso.domain_recovery')).not.toBeNull();
  expect(api.post).not.toHaveBeenCalled();

  await act(async () => {
    fireEvent.click(screen.getByText('admin_console.domain.custom.verify_domain'));
    await Promise.resolve();
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});
