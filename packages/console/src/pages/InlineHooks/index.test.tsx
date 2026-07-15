import { LogtoInlineHookKey } from '@logto/schemas';
import { fireEvent, render, screen } from '@testing-library/react';
import useSWR from 'swr';

import useTenantPathname from '@/hooks/use-tenant-pathname';

import InlineHooks from '.';
import { type InlineHookConfig, InlineHookAction } from './types';
import { getInlineHookPagePath } from './utils';

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

const mockNavigate = jest.fn();
const mockMutate = jest.fn();
const mockedUseSWR = jest.mocked(useSWR);
const mockedUseTenantPathname = jest.mocked(useTenantPathname);

const buildConfig = (key: LogtoInlineHookKey, enabled: boolean): InlineHookConfig => ({
  key,
  value: {
    script: 'export default () => ({})',
    enabled,
  },
});

describe('InlineHooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTenantPathname.mockReturnValue({
      navigate: mockNavigate,
    } as unknown as ReturnType<typeof useTenantPathname>);
  });

  it('shows every catalog hook as unconfigured and navigates to create', () => {
    mockedUseSWR.mockReturnValue({
      data: [],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<InlineHooks />);

    expect(
      screen.getByText('admin_console.inline_hooks.hooks.post_first_factor_verification.name')
    ).toBeTruthy();
    expect(screen.getByText('admin_console.inline_hooks.hooks.post_sign_in.name')).toBeTruthy();
    expect(screen.getAllByText('admin_console.inline_hooks.status.not_configured')).toHaveLength(2);

    fireEvent.click(screen.getByText('admin_console.inline_hooks.hooks.post_sign_in.name'));

    expect(mockNavigate).toHaveBeenCalledWith(
      getInlineHookPagePath(LogtoInlineHookKey.PostSignIn, InlineHookAction.Create)
    );
  });

  it('shows a configured but disabled hook and navigates to edit', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildConfig(LogtoInlineHookKey.PostFirstFactorVerification, false)],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<InlineHooks />);

    expect(screen.getByText('admin_console.inline_hooks.status.configured')).toBeTruthy();
    expect(screen.getByText('admin_console.inline_hooks.status.disabled')).toBeTruthy();
    expect(screen.getByText('admin_console.inline_hooks.status.not_configured')).toBeTruthy();

    fireEvent.click(
      screen.getByText('admin_console.inline_hooks.hooks.post_first_factor_verification.name')
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      getInlineHookPagePath(LogtoInlineHookKey.PostFirstFactorVerification, InlineHookAction.Edit)
    );
  });

  it('shows a configured and enabled hook', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildConfig(LogtoInlineHookKey.PostSignIn, true)],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<InlineHooks />);

    expect(screen.getByText('admin_console.inline_hooks.status.configured')).toBeTruthy();
    expect(screen.getByText('admin_console.inline_hooks.status.enabled')).toBeTruthy();
  });

  it('shows the loading state before data arrives', () => {
    mockedUseSWR.mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<InlineHooks />);

    expect(screen.getByRole('status', { name: 'Loading...' })).toBeTruthy();
    expect(screen.queryByText('admin_console.inline_hooks.hooks.post_sign_in.name')).toBeNull();
  });

  it('shows an error state and retries the request', () => {
    mockedUseSWR.mockReturnValue({
      error: new Error('request failed'),
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useSWR>);

    render(<InlineHooks />);

    expect(screen.getByText('request failed')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'retry' }));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
});
