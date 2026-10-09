import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { TimeoutError } from 'ky';
import type * as React from 'react';
import ReactModal from 'react-modal';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import AppConfirmModalProvider from '@/contexts/AppConfirmModalProvider';
import useOssTenantMfa from '@/hooks/use-oss-tenant-mfa';

import Settings from '.';

jest.mock('@/hooks/use-oss-tenant-mfa', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/use-tenant-pathname', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/components/LearnMore', () => ({ __esModule: true, default: () => null }));
jest.mock('@/contexts/SubscriptionDataProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    SubscriptionDataContext: createContext({
      license: { quota: { mandatoryMfa: true } },
      licenseQuota: { mandatoryMfa: true },
    }),
  };
});
jest.mock('@/components/FormCard', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <section>{children}</section>,
}));

const initialData = {
  isMfaRequired: false,
  hasMfaConfigured: false,
  isMember: true,
  isAdmin: true,
};
const updateMfaRequirement = jest.fn<Promise<void>, [boolean]>();
const getMembersWithoutMfa = jest.fn().mockResolvedValue([
  { id: 'self', name: 'Current admin' },
  { id: 'other', name: 'Other member' },
]);

const setData = (data = initialData) => {
  jest.mocked(useOssTenantMfa).mockReturnValue({
    data,
    error: undefined,
    isLoading: false,
    updateMfaRequirement,
    getMembersWithoutMfa,
  });
};

const renderSettings = () => {
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <AppConfirmModalProvider>
          <Settings />
        </AppConfirmModalProvider>
      ),
    },
    { path: '/elsewhere', element: <div>Elsewhere</div> },
  ]);
  const result = render(<RouterProvider router={router} />);
  ReactModal.setAppElement(result.container);
  return router;
};

const save = () => {
  fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.save_changes' }));
};
const discard = () => {
  fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.discard' }));
};
const confirm = async () => {
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(
    within(dialog).getByRole('button', {
      name: 'admin_console.tenants.settings.tenant_mfa_confirm_button',
    })
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  setData();
  updateMfaRequirement.mockImplementation(async (isMfaRequired) => {
    setData({ ...initialData, isMfaRequired });
  });
});

describe('OSS tenant settings', () => {
  it('stages edits, discards them, and only saves after confirming the affected members', async () => {
    const router = renderSettings();
    const toggle = screen.getByRole<HTMLInputElement>('checkbox');

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(updateMfaRequirement).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    discard();
    expect(toggle.checked).toBe(false);
    expect(updateMfaRequirement).not.toHaveBeenCalled();

    fireEvent.click(toggle);
    save();
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Current admin')).toBeTruthy();
    expect(within(dialog).getByText('Other member')).toBeTruthy();
    expect(
      within(dialog).getByText('admin_console.tenants.settings.tenant_mfa_confirm_self')
    ).toBeTruthy();
    expect(updateMfaRequirement).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'admin_console.general.cancel' }));
    await waitFor(() => {
      expect(toggle.disabled).toBe(false);
    });
    expect(toggle.checked).toBe(true);

    await act(async () => {
      await router.navigate('/elsewhere');
    });
    expect(router.state.location.pathname).toBe('/');
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.stay_on_page' }));

    save();
    await confirm();
    await waitFor(() => {
      expect(updateMfaRequirement).toHaveBeenCalledWith(true);
      expect(toggle.disabled).toBe(false);
    });
    expect(toggle.checked).toBe(true);

    fireEvent.click(toggle);
    discard();
    expect(toggle.checked).toBe(true);
  });

  it('keeps the edit after a failed save and allows retrying', async () => {
    updateMfaRequirement.mockRejectedValueOnce(new TimeoutError({} as Request));
    renderSettings();
    const toggle = screen.getByRole<HTMLInputElement>('checkbox');

    fireEvent.click(toggle);
    save();
    await confirm();
    await waitFor(() => {
      expect(updateMfaRequirement).toHaveBeenCalledTimes(1);
      expect(toggle.disabled).toBe(false);
    });
    expect(toggle.checked).toBe(true);

    save();
    await confirm();
    await waitFor(() => {
      expect(updateMfaRequirement).toHaveBeenCalledTimes(2);
      expect(toggle.disabled).toBe(false);
    });
    fireEvent.click(toggle);
    discard();
    expect(toggle.checked).toBe(true);
  });

  it('does not allow non-admin members to change MFA', () => {
    setData({ ...initialData, isAdmin: false });
    renderSettings();

    expect(screen.getByRole<HTMLInputElement>('checkbox').disabled).toBe(true);
    save();
    expect(updateMfaRequirement).not.toHaveBeenCalled();
  });
});
