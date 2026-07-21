import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';
import { toast } from 'react-hot-toast';
import { useSWRConfig } from 'swr';

import useApi from '@/hooks/use-api';

import BlocklistForm from '.';

const mockPatch = jest.fn();
const mockMutateGlobal = jest.fn();

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('swr', () => ({
  useSWRConfig: jest.fn(),
}));

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/consts', () => ({
  emailBlocklist: 'https://docs.logto.io/email-blocklist',
}));

jest.mock('@/consts/env', () => ({
  isCloud: true,
}));

jest.mock('@/consts/subscriptions', () => ({
  latestProPlanId: 'pro',
}));

jest.mock('@/contexts/SubscriptionDataProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    SubscriptionDataContext: createContext({
      mutateSubscriptionQuotaAndUsages: jest.fn(),
    }),
  };
});

jest.mock('@/hooks/use-paywall', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isFreeTenant: false,
    isPaidTenant: true,
  })),
}));

jest.mock('@/utils/form', () => ({
  trySubmitSafe:
    (callback: (...args: unknown[]) => Promise<void>) =>
    async (...args: unknown[]) =>
      callback(...args),
}));

jest.mock('@/components/DetailsForm', () => ({
  __esModule: true,
  default: ({
    children,
    onSubmit,
    onDiscard,
  }: {
    readonly children: React.ReactNode;
    readonly onSubmit: () => Promise<void>;
    readonly onDiscard?: () => void;
  }) => (
    <form>
      {children}
      <button type="button" onClick={onDiscard}>
        general.discard
      </button>
      <button type="button" onClick={onSubmit}>
        general.save_changes
      </button>
    </form>
  ),
}));

jest.mock('@/pages/Security/PaywallNotification', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/UnsavedChangesAlertModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/FeatureTag', () => ({
  CombinedAddOnAndFeatureTag: () => null,
  addOnLabels: {
    addOnBundle: 'addOnBundle',
  },
}));

jest.mock('@/components/FormCard', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <section>{children}</section>,
}));

jest.mock('@/components/LearnMore', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({
    children,
    title,
  }: {
    readonly children: React.ReactNode;
    readonly title: string;
  }) => (
    <label>
      {title}
      {children}
    </label>
  ),
}));

jest.mock('@/ds-components/InlineNotification', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => (
    <div role="alert">{children}</div>
  ),
}));

const mockedUseApi = jest.mocked(useApi);
const mockedUseSWRConfig = jest.mocked(useSWRConfig);

const renderBlocklistForm = () =>
  render(
    <BlocklistForm
      formData={{
        blockDisposableAddresses: false,
        blockSubaddressing: true,
        customAllowlist: ['allowed@example.com'],
        customBlocklist: ['@blocked.com'],
      }}
    />
  );

const getCustomAllowlistInput = () => {
  const inputs = screen.getAllByRole('textbox');
  const input = inputs.at(-1);

  if (!input) {
    throw new Error('Custom allowlist input not found.');
  }

  return input;
};

const addCustomAllowlistValue = async (value: string) => {
  const input = getCustomAllowlistInput();

  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getByText(value)).toBeTruthy();
  });
};

describe('BlocklistForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatch.mockReturnValue({
      json: async () => ({
        emailBlocklistPolicy: {
          blockDisposableAddresses: false,
          blockSubaddressing: true,
          customAllowlist: ['allowed@example.com'],
          customBlocklist: ['@blocked.com'],
        },
      }),
    });
    mockedUseApi.mockReturnValue({
      patch: mockPatch,
    } as unknown as ReturnType<typeof useApi>);
    mockedUseSWRConfig.mockReturnValue({
      mutate: mockMutateGlobal,
    } as unknown as ReturnType<typeof useSWRConfig>);
  });

  it('renders the custom allowlist section from the form data', () => {
    renderBlocklistForm();

    const content = document.body.textContent ?? '';

    expect(screen.getByText('allowed@example.com')).toBeTruthy();
    expect(screen.getByText('security.blocklist.custom_email_allowlist.title')).toBeTruthy();
    expect(
      screen.getByText('admin_console.security.blocklist.custom_email_allowlist.description')
    ).toBeTruthy();
    expect(content.indexOf('security.blocklist.custom_email_address.title')).toBeLessThan(
      content.indexOf('security.blocklist.custom_email_allowlist.title')
    );
  });

  it('sends customAllowlist in the sign-in experience patch payload', async () => {
    renderBlocklistForm();

    await addCustomAllowlistValue('new-allowed@example.com');
    fireEvent.click(screen.getByText('general.save_changes'));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('api/sign-in-exp', {
        json: {
          emailBlocklistPolicy: {
            blockDisposableAddresses: false,
            blockSubaddressing: true,
            customAllowlist: ['allowed@example.com', 'new-allowed@example.com'],
            customBlocklist: ['@blocked.com'],
          },
        },
      });
    });
    expect(mockMutateGlobal).toHaveBeenCalledWith('api/sign-in-exp');
    expect(toast.success).toHaveBeenCalledWith('admin_console.general.saved');
  });

  it('shows cheap warnings without blocking save', async () => {
    renderBlocklistForm();

    await addCustomAllowlistValue('foo+bar@example.com');

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'admin_console.security.blocklist.custom_email_allowlist.warnings.blocked_subaddressing'
      );
    });

    fireEvent.click(screen.getByText('general.save_changes'));

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalled();
    });
  });

  it('validates duplicate custom allowlist entries case-insensitively', async () => {
    renderBlocklistForm();

    const input = getCustomAllowlistInput();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'ALLOWED@example.com' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(
        screen.getByText('admin_console.security.blocklist.custom_email_allowlist.duplicate_error')
      ).toBeTruthy();
    });
  });
});
