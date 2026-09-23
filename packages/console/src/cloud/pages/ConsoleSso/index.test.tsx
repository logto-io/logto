import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';

import { type ConsoleSsoConnector } from '@/cloud/types/router';
import useCurrentUser from '@/hooks/use-current-user';

import ConsoleSso from '.';
import { useConsoleSsoConnectors } from './use-console-sso';

jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/consts/env', () => ({ isCloud: true }));
jest.mock('./use-console-sso', () => ({ useConsoleSsoConnectors: jest.fn() }));
jest.mock('@/containers/AppBoundary', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => children,
}));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Topbar', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/ItemPreview', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/CardTitle', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/Table/TablePlaceholder', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/DetailsPage/Skeleton', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Region', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/EnterpriseSso/index.module.scss', () => ({}));
jest.mock('@/scss/page-layout.module.scss', () => ({}));
jest.mock('@/pages/EnterpriseSso/SsoConnectorLogo', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  default: ({ title, onClick }: { readonly title: string; readonly onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      {title}
    </button>
  ),
}));
jest.mock('@/ds-components/Table', () => ({
  __esModule: true,
  default: ({
    rowClickHandler,
  }: {
    readonly rowClickHandler: (row: ConsoleSsoConnector) => void;
  }) => (
    <button
      type="button"
      onClick={() => {
        rowClickHandler({ id: 'existing-relation-id' } as ConsoleSsoConnector);
      }}
    >
      connector row
    </button>
  ),
}));
jest.mock('./CreationModal', () => ({
  __esModule: true,
  default: ({ onClose }: { readonly onClose: (id?: string) => void }) => (
    <button
      type="button"
      onClick={() => {
        onClose('new-relation-id');
      }}
    >
      finish creation
    </button>
  ),
}));

function DetailPath() {
  const { connectorId, tab } = useParams();
  return <div>{`${connectorId} ${tab}`}</div>;
}

const connector = { id: 'existing-relation-id' };

const renderList = () =>
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={['/console-sso']}
    >
      <Routes>
        <Route path="/console-sso" element={<ConsoleSso />} />
        <Route path="/console-sso/:connectorId/:tab" element={<DetailPath />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
  jest.mocked(useConsoleSsoConnectors).mockReturnValue({
    data: [connector],
    mutate: jest.fn(),
  } as unknown as ReturnType<typeof useConsoleSsoConnectors>);
});

it('opens the clicked connector on its Connection page', () => {
  renderList();
  fireEvent.click(screen.getByText('connector row'));
  expect(screen.getByText('existing-relation-id connection')).toBeTruthy();
});

it('opens the newly created connector on its Connection page', () => {
  renderList();
  fireEvent.click(screen.getByText('cloud.console_sso.create'));
  fireEvent.click(screen.getByText('finish creation'));
  expect(screen.getByText('new-relation-id connection')).toBeTruthy();
});
