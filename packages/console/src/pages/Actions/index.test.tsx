import { LogtoActionKey } from '@logto/schemas';
import { fireEvent, render, screen } from '@testing-library/react';
import useSWR from 'swr';

import useTenantPathname from '@/hooks/use-tenant-pathname';

import Actions from '.';
import { type ActionConfig, ActionPageMode } from './types';
import { getActionPagePath } from './utils';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/scss/page-layout.module.scss', () => ({
  container: 'container',
  headline: 'headline',
}));

jest.mock('@/components/PageMeta', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/ds-components/CardTitle', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { readonly title: string; readonly subtitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

jest.mock('@/components/RequestDataError', () => ({
  __esModule: true,
  default: ({ error, onRetry }: { readonly error: Error; readonly onRetry?: () => void }) => (
    <div>
      <span>{error.message}</span>
      {onRetry && <button onClick={onRetry}>retry</button>}
    </div>
  ),
}));

jest.mock('./DeleteConfirmModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    actionType,
  }: {
    readonly isOpen: boolean;
    readonly actionType?: LogtoActionKey;
  }) => (isOpen ? <div>delete-modal:{actionType}</div> : null),
}));

const mockNavigate = jest.fn();
const mockMutate = jest.fn();
const mockedUseSWR = jest.mocked(useSWR);
const mockedUseTenantPathname = jest.mocked(useTenantPathname);

const buildConfig = (key: LogtoActionKey, enabled: boolean): ActionConfig => ({
  key,
  value: {
    script: 'export default () => ({})',
    enabled,
  },
});

describe('Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTenantPathname.mockReturnValue({
      navigate: mockNavigate,
    } as unknown as ReturnType<typeof useTenantPathname>);
  });

  it('shows every catalog action as unconfigured and navigates to create', () => {
    mockedUseSWR.mockReturnValue({
      data: [],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<Actions />);

    expect(
      screen.getByText('admin_console.actions.types.post_first_factor_verification.name')
    ).toBeTruthy();
    expect(screen.getByText('admin_console.actions.types.post_sign_in.name')).toBeTruthy();
    expect(screen.getAllByText('admin_console.actions.status.not_configured')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'admin_console.general.delete' })).toBeNull();

    fireEvent.click(screen.getByText('admin_console.actions.types.post_sign_in.name'));

    expect(mockNavigate).toHaveBeenCalledWith(
      getActionPagePath(LogtoActionKey.PostSignIn, ActionPageMode.Create)
    );
  });

  it('shows a configured but disabled action, navigates to edit, and can open delete modal', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildConfig(LogtoActionKey.PostFirstFactorVerification, false)],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<Actions />);

    expect(screen.getByText('admin_console.actions.status.configured')).toBeTruthy();
    expect(screen.getByText('admin_console.actions.status.disabled')).toBeTruthy();
    expect(screen.getByText('admin_console.actions.status.not_configured')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'admin_console.general.delete' })).toBeTruthy();

    fireEvent.click(
      screen.getByText('admin_console.actions.types.post_first_factor_verification.name')
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      getActionPagePath(LogtoActionKey.PostFirstFactorVerification, ActionPageMode.Edit)
    );

    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.delete' }));

    expect(
      screen.getByText(`delete-modal:${LogtoActionKey.PostFirstFactorVerification}`)
    ).toBeTruthy();
  });

  it('shows a configured and enabled action', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildConfig(LogtoActionKey.PostSignIn, true)],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<Actions />);

    expect(screen.getByText('admin_console.actions.status.configured')).toBeTruthy();
    expect(screen.getByText('admin_console.actions.status.enabled')).toBeTruthy();
  });

  it('shows the loading state before data arrives', () => {
    mockedUseSWR.mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<Actions />);

    expect(screen.getByRole('status', { name: 'Loading...' })).toBeTruthy();
    expect(screen.queryByText('admin_console.actions.types.post_sign_in.name')).toBeNull();
  });

  it('shows an error state and retries the request', () => {
    mockedUseSWR.mockReturnValue({
      error: new Error('request failed'),
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<Actions />);

    expect(screen.getByText('request failed')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'retry' }));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
