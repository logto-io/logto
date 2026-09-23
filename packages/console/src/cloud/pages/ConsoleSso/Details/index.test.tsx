import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import { useConsoleSsoConnector, useConsoleSsoConnectors } from '../use-console-sso';

import Details from '.';

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: jest.fn(),
  toastResponseError: jest.fn(),
}));
jest.mock('@/consts/env', () => ({ isCloud: true }));
jest.mock('@/contexts/TenantsProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');
  return {
    GlobalRoute: { ConsoleSso: '/console-sso' },
    TenantsContext: createContext({ currentTenantId: '' }),
  };
});
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../use-console-sso', () => ({
  useConsoleSsoConnector: jest.fn(),
  useConsoleSsoConnectors: jest.fn(),
}));
jest.mock('@/containers/AppBoundary', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => children,
}));
jest.mock('@/components/Topbar', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/RequestDataError', () => ({
  __esModule: true,
  default: () => <div>request error</div>,
}));
jest.mock('@/components/DetailsPage/Skeleton', () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/pages/EnterpriseSso/SsoConnectorLogo', () => ({
  __esModule: true,
  default: () => <div>provider logo</div>,
}));
jest.mock('@/pages/EnterpriseSsoDetails/index.module.scss', () => ({}));
jest.mock('@/components/DetailsPage/DetailsPageHeader', () => ({
  __esModule: true,
  default: ({
    title,
    actionMenuItems,
  }: {
    readonly title: string;
    readonly actionMenuItems: Array<{ title: string; onClick: () => void }>;
  }) => (
    <header>
      {title}
      {actionMenuItems.map(({ title, onClick }) => (
        <button key={title} type="button" onClick={onClick}>
          {title}
        </button>
      ))}
    </header>
  ),
}));
jest.mock('@/ds-components/ConfirmModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onConfirm,
  }: {
    readonly isOpen: boolean;
    readonly onConfirm: () => Promise<void>;
  }) => isOpen && <button onClick={onConfirm}>confirm deletion</button>,
}));
jest.mock('./Connection', () => ({ __esModule: true, default: () => <div>connection form</div> }));
jest.mock('./Experience', () => ({ __esModule: true, default: () => <div>experience form</div> }));

const connector = {
  id: 'relation-123',
  connectorName: 'console-sso-internal',
  name: 'OIDC',
  branding: { displayName: 'My IdP' },
};
const mockDetailMutate = jest.fn().mockResolvedValue(connector);
const mockListMutate = jest.fn().mockResolvedValue([connector]);
const mockDelete = jest.fn().mockResolvedValue(undefined);
const mockApi = { delete: mockDelete };

const renderDetails = (path = '/console-sso/relation-123') =>
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[path]}
    >
      <Routes>
        <Route path="/console-sso" element={<div>connector list</div>} />
        <Route path="/console-sso/:connectorId/:tab?" element={<Details />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
  jest.mocked(useConsoleSsoConnector).mockReturnValue({
    data: connector,
    mutate: mockDetailMutate,
  } as unknown as ReturnType<typeof useConsoleSsoConnector>);
  jest.mocked(useConsoleSsoConnectors).mockReturnValue({
    mutate: mockListMutate,
  } as unknown as ReturnType<typeof useConsoleSsoConnectors>);
  jest.mocked(useCloudApi).mockReturnValue(mockApi as unknown as ReturnType<typeof useCloudApi>);
});

it('redirects to Connection and switches between both global detail tabs', async () => {
  renderDetails();
  expect(await screen.findByText('connection form')).toBeTruthy();
  expect(screen.getByText('My IdP')).toBeTruthy();

  fireEvent.click(screen.getByText('admin_console.enterprise_sso_details.tab_experience'));
  expect(await screen.findByText('experience form')).toBeTruthy();

  fireEvent.click(screen.getByText('admin_console.cloud.console_sso.back_to_list'));
  expect(await screen.findByText('connector list')).toBeTruthy();
});

it('deletes by the Cloud relation ID and returns to the global list', async () => {
  renderDetails('/console-sso/relation-123/connection');
  fireEvent.click(await screen.findByText('general.delete'));
  fireEvent.click(screen.getByText('confirm deletion'));

  await waitFor(() => {
    expect(mockDelete).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
      params: { connectorId: 'relation-123' },
    });
    expect(screen.getByText('connector list')).toBeTruthy();
  });
  expect(mockDetailMutate).toHaveBeenCalled();
  expect(mockListMutate).toHaveBeenCalled();
});
