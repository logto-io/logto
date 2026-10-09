import { OrganizationInvitationStatus } from '@logto/schemas';
import { assert, noop } from '@silverhand/essentials';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type * as React from 'react';
import ReactModal from 'react-modal';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { type TenantInvitationResponse } from '@/cloud/types/router';
import type { EnvTestUtils } from '@/test-utils/env';

import TenantMembers from '.';
import Invitations from './Invitations';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);

jest.mock('@/components/Region', () => ({ defaultRegionName: 'EU' }));

jest.mock('@/contexts/AppThemeProvider', () => ({
  AppThemeContext: jest.requireActual<typeof React>('react').createContext({ theme: 'light' }),
}));

jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { canInviteMember: true, canRemoveMember: true } }),
}));

jest.mock('@/hooks/use-user-preferences', () => ({
  __esModule: true,
  default: () => ({ data: {}, update: jest.fn() }),
}));

jest.mock('@/hooks/use-confirm-modal', () => ({
  useConfirmModal: () => ({ show: async () => [true] }),
}));

// Scrollbar geometry is not available in jsdom; keep the table and its contents real.
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
}));

const mockGetInvitations = jest.fn<Promise<TenantInvitationResponse[]>, unknown[]>();
const mockInvite = jest.fn<Promise<void>, unknown[]>();

jest.mock('./use-tenant-members-api', () => ({
  __esModule: true,
  default: () => ({
    membersKey: 'me/tenant/members',
    invitationsKey: 'me/tenant/invitations',
    getMembers: async () => [],
    getInvitations: mockGetInvitations,
    invite: mockInvite,
  }),
}));

const invitation: TenantInvitationResponse = {
  id: 'invitation-id',
  tenantId: 'admin',
  invitee: 'new-member@example.com',
  inviterId: 'admin-id',
  inviterName: 'Admin',
  acceptedUserId: null,
  organizationId: 't-default',
  organizationRoles: [],
  status: OrganizationInvitationStatus.Pending,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  expiresAt: 1_700_604_800_000,
};

const membersPath = '/console/tenant-settings/members';

function TestRoutes() {
  return useRoutes([
    {
      path: membersPath,
      element: <TenantMembers />,
      children: [
        { index: true, element: <div>Members list</div> },
        { path: 'invitations', element: <Invitations /> },
      ],
    },
  ]);
}

const renderMembers = async (entry: 'members' | 'invitations' | 'empty') => {
  await act(async () => {
    const { container } = render(
      <SWRConfig
        value={{
          provider: () => new Map(),
          // Keep the pre-create read deduplicated throughout the interaction.
          dedupingInterval: 60_000,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        }}
      >
        <MemoryRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
          initialEntries={[entry === 'members' ? membersPath : `${membersPath}/invitations`]}
        >
          <TestRoutes />
        </MemoryRouter>
      </SWRConfig>
    );
    ReactModal.setAppElement(container);
  });
};

const submitInvitation = async (entry: 'members' | 'invitations' | 'empty') => {
  const buttons = screen.getAllByRole('button', {
    name: 'admin_console.tenant_members.invite_members',
  });
  const button = buttons[entry === 'empty' ? 1 : 0];
  assert(button, new Error(`Missing invite button for ${entry}`));
  fireEvent.click(button);
  const dialog = await screen.findByRole('dialog');
  const input = within(dialog).getByRole('textbox');
  fireEvent.change(input, { target: { value: invitation.invitee } });
  fireEvent.blur(input);
  fireEvent.click(
    within(dialog).getByRole('button', { name: 'admin_console.tenant_members.invite_members' })
  );
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
};

describe('tenant invitation creation', () => {
  beforeEach(() => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    mockGetInvitations.mockReset().mockResolvedValue([]);
    mockInvite.mockReset().mockImplementation(async () => {
      mockGetInvitations.mockResolvedValue([invitation]);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['members', 'invitations', 'empty'] as const)(
    'shows the new pending invitation from %s with a recently cached empty list',
    async (entry) => {
      await renderMembers(entry);
      await submitInvitation(entry);

      const cell = await screen.findByText(invitation.invitee);
      expect(cell.closest('tr')?.textContent).toContain(OrganizationInvitationStatus.Pending);
    }
  );

  it('does not let a slow pre-create read hide the invitation created from Members', async () => {
    // eslint-disable-next-line @silverhand/fp/no-let -- Resolve the pre-create request after the fresh data is displayed.
    let resolveInitialRead: (value: TenantInvitationResponse[]) => void = noop;
    const initialRead = new Promise<TenantInvitationResponse[]>((resolve) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Capture the deferred request's resolver.
      resolveInitialRead = resolve;
    });
    mockGetInvitations.mockReturnValueOnce(initialRead);

    await renderMembers('members');
    await submitInvitation('members');
    await screen.findByText(invitation.invitee);

    await act(async () => {
      resolveInitialRead([]);
      await initialRead;
    });

    const cell = screen.getByText(invitation.invitee);
    expect(cell.closest('tr')?.textContent).toContain(OrganizationInvitationStatus.Pending);
  });
});
