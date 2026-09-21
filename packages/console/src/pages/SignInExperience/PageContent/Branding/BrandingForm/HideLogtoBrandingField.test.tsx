import { runInThisContext } from 'node:vm';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ReactModal from 'react-modal';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import HideLogtoBrandingField from './HideLogtoBrandingField';

const mockIsDevFeaturesEnabled = jest.fn(() => true);

jest.mock('@/consts/env', () => ({
  isCloud: false,
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

jest.mock('@/contexts/TenantsProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return { TenantsContext: createContext({ currentTenantId: 'default' }) };
});

jest.mock('@/components/FeatureTag', () => ({
  CloudTag: ({ children }: { readonly children: React.ReactNode }) => <span>{children}</span>,
  CombinedAddOnAndFeatureTag: () => null,
}));

jest.mock('@/scss/modal.module.scss', () => ({}));

const editorPath = '/console/sign-in-experience/branding';
const licensePath = '/console/tenant-settings/license';
const entry = 'sign_in_exp_hide_logto_branding_oss_note';
const linkName = 'admin_console.upsell.explore_self_hosted_plans';

function Editor() {
  const form = useForm({ defaultValues: { name: 'Original name' } });

  return (
    <FormProvider {...form}>
      <input aria-label="Name" {...form.register('name')} />
      <HideLogtoBrandingField variant="oss" isEnabledInCloud={false} />
      <UnsavedChangesAlertModal
        hasUnsavedChanges={form.formState.isDirty}
        parentPath="/console/sign-in-experience"
      />
    </FormProvider>
  );
}

const renderEditor = () => {
  const router = createMemoryRouter(
    [
      { path: editorPath, element: <Editor /> },
      { path: licensePath, element: <div>License page</div> },
    ],
    { initialEntries: [editorPath] }
  );
  const { container } = render(<RouterProvider router={router} />);
  ReactModal.setAppElement(container);

  return router;
};

describe('self-hosted plans navigation from the branding editor', () => {
  const originalRequest = globalThis.Request;

  beforeAll(() => {
    // JSDOM does not expose Request; use Node's native implementation for the real data router.
    Reflect.set(globalThis, 'Request', runInThisContext('Request'));
  });

  afterAll(() => {
    Reflect.set(globalThis, 'Request', originalRequest);
  });

  beforeEach(() => {
    mockIsDevFeaturesEnabled.mockReturnValue(true);
  });

  it('keeps unsaved edits on cancel and navigates only after confirming', async () => {
    const router = renderEditor();
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
      target: { value: 'Unsaved name' },
    });
    fireEvent.click(screen.getByRole('link', { name: linkName }));

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(router.state.location.pathname).toBe(editorPath);

    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.stay_on_page' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(router.state.location.pathname).toBe(editorPath);
    expect(screen.getByDisplayValue('Unsaved name')).toBeTruthy();

    fireEvent.click(screen.getByRole('link', { name: linkName }));
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.leave_page' }));

    expect(await screen.findByText('License page')).toBeTruthy();
    expect(router.state.location.pathname).toBe(licensePath);
    expect(router.state.location.search).toBe(`?utm_content=${entry}`);
  });

  it('navigates directly when there are no unsaved edits', async () => {
    const router = renderEditor();
    const link = screen.getByRole('link', { name: linkName });

    expect(link.getAttribute('href')).toBe(`${licensePath}?utm_content=${entry}`);
    expect(link.getAttribute('target')).toBeNull();
    fireEvent.click(link);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(licensePath);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the external website link in a new tab when dev features are disabled', () => {
    mockIsDevFeaturesEnabled.mockReturnValue(false);
    renderEditor();
    const link = screen.getByRole('link', { name: linkName });

    expect(link.getAttribute('href')).toBe(
      `https://logto.io/self-hosted-plans?utm_source=logto_oss&utm_medium=console&utm_campaign=self_hosted_plans&utm_content=${entry}`
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });
});
