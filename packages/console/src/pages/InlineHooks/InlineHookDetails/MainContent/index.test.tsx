import { LogtoInlineHookKey } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSWRConfig } from 'swr';

import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import { InlineHookAction } from '../../types';
import { getInlineHookApiPath, getInlineHookPagePath, inlineHooksPath } from '../../utils';

import MainContent from '.';

jest.mock('swr', () => ({
  ...jest.requireActual('swr'),
  useSWRConfig: jest.fn(),
}));

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/utils/form', () => ({
  trySubmitSafe: (handler: (data: unknown) => Promise<void>) => async (data: unknown) =>
    handler(data),
}));

jest.mock('@/components/UnsavedChangesAlertModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./ScriptSection', () => ({
  __esModule: true,
  default: () => <div>script-section</div>,
}));

jest.mock('./SettingsSection', () => ({
  __esModule: true,
  default: () => <div>settings-section</div>,
}));

const mockedUseApi = jest.mocked(useApi);
const mockedUseTenantPathname = jest.mocked(useTenantPathname);
const mockedUseSWRConfig = jest.mocked(useSWRConfig);

const mockNavigate = jest.fn();
const mockMutate = jest.fn();
const mockGlobalMutate = jest.fn();
const mockPut = jest.fn();
const mockJson = jest.fn();

describe('InlineHookDetails MainContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTenantPathname.mockReturnValue({
      navigate: mockNavigate,
    } as unknown as ReturnType<typeof useTenantPathname>);
    mockedUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
    } as unknown as ReturnType<typeof useSWRConfig>);
    mockedUseApi.mockReturnValue({
      put: mockPut,
    } as unknown as ReturnType<typeof useApi>);
    mockJson.mockResolvedValue({
      script: 'const runInlineHook = () => ({ action: "updateUser" });',
      enabled: true,
      onExecutionError: 'block',
    });
    mockPut.mockReturnValue({
      json: mockJson,
    });
    mockMutate.mockResolvedValue(undefined);
    mockGlobalMutate.mockResolvedValue(undefined);
  });

  it('creates a hook, invalidates cache, and navigates to edit mode', async () => {
    render(
      <MainContent
        action={InlineHookAction.Create}
        hookType={LogtoInlineHookKey.PostSignIn}
        mutate={mockMutate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.create' }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledTimes(1);
    });

    const [apiPath, options] = mockPut.mock.calls[0] as [
      string,
      { json: { enabled: boolean; onExecutionError: string; script: string } },
    ];
    expect(apiPath).toBe(getInlineHookApiPath(LogtoInlineHookKey.PostSignIn));
    expect(options.json.enabled).toBe(true);
    expect(options.json.onExecutionError).toBe('block');
    expect(options.json.script.length).toBeGreaterThan(0);
    expect(mockMutate).toHaveBeenCalled();
    expect(mockGlobalMutate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      getInlineHookPagePath(LogtoInlineHookKey.PostSignIn, InlineHookAction.Edit),
      { replace: true }
    );
  });

  it('renders the script and settings sections in edit mode', () => {
    render(
      <MainContent
        action={InlineHookAction.Edit}
        hookType={LogtoInlineHookKey.PostFirstFactorVerification}
        data={{
          script: 'const runInlineHook = () => ({ action: "updateUser", passwordVerified: true });',
          enabled: false,
          onExecutionError: 'block',
        }}
        mutate={mockMutate}
      />
    );

    expect(screen.getByText('script-section')).toBeTruthy();
    expect(screen.getByText('settings-section')).toBeTruthy();
  });

  it('discards create mode back to the list page', () => {
    render(
      <MainContent
        action={InlineHookAction.Create}
        hookType={LogtoInlineHookKey.PostSignIn}
        mutate={mockMutate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.discard' }));
    expect(mockNavigate).toHaveBeenCalledWith(inlineHooksPath);
  });
});
