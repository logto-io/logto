import type { TrustedDeviceResponse } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import type * as React from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

import UserTrustedDevices from '.';

const mockDelete = jest.fn();
const mockMutate = jest.fn();
const mockShowConfirm = jest.fn();

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-confirm-modal', () => ({
  useConfirmModal: jest.fn(),
}));

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getTo: (path: string) => path }),
}));

jest.mock('@/hooks/use-theme', () => ({
  __esModule: true,
  default: () => 'light',
}));

jest.mock('@/components/FormCard', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <section>{children}</section>,
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
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

jest.mock('@/components/EmptyDataPlaceholder', () => ({
  __esModule: true,
  default: ({ title }: { readonly title: React.ReactNode }) => <div>{title}</div>,
}));

jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
}));

const mockedUseApi = jest.mocked(useApi);
const mockedUseConfirmModal = jest.mocked(useConfirmModal);
const mockedUseSWR = jest.mocked(useSWR);

const chromeUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const trustedDevice: TrustedDeviceResponse & { readonly ip: string } = {
  id: 'trusted-device-id',
  userAgent: chromeUserAgent,
  country: 'China',
  city: 'Shanghai',
  createdAt: new Date('2026-07-01T00:00:00.000Z').getTime(),
  lastUsedAt: new Date('2026-07-20T00:00:00.000Z').getTime(),
  expiresAt: new Date(2026, 6, 26, 12).getTime(),
  ip: '192.0.2.1',
};

const renderTrustedDevices = () => render(<UserTrustedDevices userId="user-id" />);

describe('UserTrustedDevices', () => {
  beforeEach(async () => {
    await i18next.changeLanguage('en');
    jest.clearAllMocks();
    mockDelete.mockResolvedValue(undefined);
    mockMutate.mockResolvedValue(undefined);
    mockShowConfirm.mockResolvedValue([true]);
    mockedUseApi.mockReturnValue({
      delete: mockDelete,
    } as unknown as ReturnType<typeof useApi>);
    mockedUseConfirmModal.mockReturnValue({
      show: mockShowConfirm,
    } as unknown as ReturnType<typeof useConfirmModal>);
  });

  it('shows the loading state while trusted devices are being fetched', () => {
    mockedUseSWR.mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();

    expect(document.querySelectorAll('.rect').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'admin_console.general.remove' })).toBeNull();
  });

  it('renders approved device metadata without exposing the raw IP address', () => {
    mockedUseSWR.mockReturnValue({
      data: [trustedDevice],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();

    expect(screen.getByText('Chrome on Apple Macintosh')).toBeTruthy();
    expect(screen.getByText('trusted-device-id')).toBeTruthy();
    expect(screen.getByText('Shanghai, China')).toBeTruthy();
    expect(screen.getByText('Jul 26, 2026')).toBeTruthy();
    expect(screen.queryByText('192.0.2.1')).toBeNull();
    expect(screen.getByText('admin_console.user_details.sessions.name_column')).toBeTruthy();
    expect(screen.getByText('admin_console.user_details.sessions.location_column')).toBeTruthy();
    expect(
      screen.getByText('admin_console.user_details.personal_access_tokens.expires_at')
    ).toBeTruthy();
  });

  it('formats the expiry date using the current Console language', async () => {
    await i18next.changeLanguage('ja');
    mockedUseSWR.mockReturnValue({
      data: [trustedDevice],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();

    expect(screen.getByText('2026年7月26日')).toBeTruthy();
  });

  it('shows the empty state when the user has no active trusted devices', () => {
    mockedUseSWR.mockReturnValue({
      data: [],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();

    expect(screen.getByText('admin_console.mfa.trusted_device.management_empty')).toBeTruthy();
  });

  it('shows an error and retries the request', () => {
    mockedUseSWR.mockReturnValue({
      error: new Error('request failed'),
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();

    expect(screen.getByText('request failed')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.retry' }));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('requests all trusted devices without pagination parameters', () => {
    mockedUseSWR.mockReturnValue({
      data: [trustedDevice],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();

    expect(mockedUseSWR).toHaveBeenLastCalledWith('api/users/user-id/trusted-devices');
  });

  it('keeps the device when removal is canceled', async () => {
    mockShowConfirm.mockResolvedValue([false]);
    mockedUseSWR.mockReturnValue({
      data: [trustedDevice],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.remove' }));

    await waitFor(() => {
      expect(mockShowConfirm).toHaveBeenCalledTimes(1);
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('removes a confirmed device and refreshes the successful state', async () => {
    mockedUseSWR.mockReturnValue({
      data: [trustedDevice],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.remove' }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(
        'api/users/user-id/trusted-devices/trusted-device-id'
      );
    });
    expect(mockShowConfirm).toHaveBeenCalledWith({
      ModalContent: 'admin_console.mfa.trusted_device.management_deletion_confirmation',
      confirmButtonText: 'general.remove',
    });
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'admin_console.mfa.trusted_device.management_removed'
    );
  });

  it('keeps the current list when removal fails', async () => {
    mockDelete.mockRejectedValue(new Error('request failed'));
    mockedUseSWR.mockReturnValue({
      data: [trustedDevice],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    renderTrustedDevices();
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.remove' }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });
    expect(mockMutate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
