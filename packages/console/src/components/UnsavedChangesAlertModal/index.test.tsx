import { runInThisContext } from 'node:vm';

import { act, render, screen } from '@testing-library/react';
import ReactModal from 'react-modal';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { type EnvTestUtils } from '@/test-utils/env';

import UnsavedChangesAlertModal from '.';

const mockUseReadOnlyAccess = jest.fn(() => false);

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@/components/FeatureTag', () => ({ CombinedAddOnAndFeatureTag: () => null }));
jest.mock('@/contexts/ReadOnlyAccessProvider', () => ({
  useReadOnlyAccess: () => mockUseReadOnlyAccess(),
}));

const detailsPath = '/details';
const otherPath = '/other';

const leaveDetailsPage = async (hasUnsavedChanges: boolean) => {
  const router = createMemoryRouter(
    [
      {
        path: detailsPath,
        element: <UnsavedChangesAlertModal hasUnsavedChanges={hasUnsavedChanges} />,
      },
      { path: otherPath, element: <div>Other page</div> },
    ],
    { initialEntries: [detailsPath] }
  );
  const { container } = render(<RouterProvider router={router} />);
  ReactModal.setAppElement(container);
  await act(async () => router.navigate(otherPath));

  return router;
};

describe('UnsavedChangesAlertModal', () => {
  const originalRequest = globalThis.Request;

  beforeAll(() => {
    // JSDOM does not expose Request; use Node's native implementation for the real data router.
    Reflect.set(globalThis, 'Request', runInThisContext('Request'));
  });

  afterAll(() => {
    Reflect.set(globalThis, 'Request', originalRequest);
  });

  it('asks before leaving with unsaved changes', async () => {
    mockUseReadOnlyAccess.mockReturnValue(false);
    const router = await leaveDetailsPage(true);

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(router.state.location.pathname).toBe(detailsPath);
  });

  it('leaves without asking when nothing changed', async () => {
    mockUseReadOnlyAccess.mockReturnValue(false);
    const router = await leaveDetailsPage(false);

    expect(await screen.findByText('Other page')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(router.state.location.pathname).toBe(otherPath);
  });

  it('lets a read-only member leave without asking', async () => {
    mockUseReadOnlyAccess.mockReturnValue(true);
    const router = await leaveDetailsPage(true);

    expect(await screen.findByText('Other page')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(router.state.location.pathname).toBe(otherPath);
  });
});
