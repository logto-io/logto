import { LogtoInlineHookKey } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import { InlineHookAction } from '../types';
import { getInlineHookApiPath, inlineHooksPath } from '../utils';

import InlineHookDetails from '.';
import useDataFetch from './use-data-fetch';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock('swr', () => ({
  ...jest.requireActual('swr'),
  useSWRConfig: jest.fn(),
}));

jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: jest.fn(),
  RequestError: class RequestError extends Error {
    status: number;

    constructor(status: number) {
      super('request error');
      this.status = status;
    }
  },
}));

jest.mock('@/hooks/use-confirm-modal', () => ({
  useConfirmModal: jest.fn(),
}));

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./use-data-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/utils/form', () => ({
  trySubmitSafe: (handler: (data: unknown) => Promise<void>) => async (data: unknown) =>
    handler(data),
}));

jest.mock('@/components/PageMeta', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/DetailsPage', () => ({
  __esModule: true,
  default: ({
    children,
    isLoading,
    error,
  }: {
    readonly children: React.ReactNode;
    readonly isLoading?: boolean;
    readonly error?: Error;
  }) => (
    <div>
      {isLoading && <div>loading</div>}
      {error && <div>{error.message}</div>}
      {children}
    </div>
  ),
}));

jest.mock('@/components/DetailsPage/DetailsPageHeader', () => ({
  __esModule: true,
  default: ({
    title,
    actionMenuItems,
  }: {
    readonly title: React.ReactNode;
    readonly actionMenuItems?: Array<{ title: string; onClick: () => void }>;
  }) => (
    <div>
      <h1>{title}</h1>
      {actionMenuItems?.map((item) => (
        <button key={item.title} type="button" onClick={item.onClick}>
          {item.title}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/components/EmptyDataPlaceholder', () => ({
  __esModule: true,
  default: () => <div>empty</div>,
}));

jest.mock('./MainContent', () => ({
  __esModule: true,
  default: () => <div>main-content</div>,
}));

jest.mock('./PageLoadingSkeleton', () => ({
  __esModule: true,
  default: () => <div>skeleton</div>,
}));

jest.mock('./CodeEditorLoadingContext', () => ({
  CodeEditorLoadingContext: {
    Provider: ({ children }: { readonly children: React.ReactNode }) => children,
  },
}));

const mockedUseParams = jest.mocked(useParams);
const mockedUseDataFetch = jest.mocked(useDataFetch);
const mockedUseApi = jest.mocked(useApi);
const mockedUseConfirmModal = jest.mocked(useConfirmModal);
const mockedUseTenantPathname = jest.mocked(useTenantPathname);
const mockedUseSWRConfig = jest.mocked(useSWRConfig);

const mockNavigate = jest.fn();
const mockMutate = jest.fn();
const mockGlobalMutate = jest.fn();
const mockShow = jest.fn();
const mockDelete = jest.fn();
const mockPut = jest.fn();

describe('InlineHookDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseTenantPathname.mockReturnValue({
      navigate: mockNavigate,
    } as unknown as ReturnType<typeof useTenantPathname>);
    mockedUseConfirmModal.mockReturnValue({
      show: mockShow,
    } as unknown as ReturnType<typeof useConfirmModal>);
    mockedUseSWRConfig.mockReturnValue({
      mutate: mockGlobalMutate,
    } as unknown as ReturnType<typeof useSWRConfig>);
    mockedUseApi.mockReturnValue({
      delete: mockDelete,
      put: mockPut,
    } as unknown as ReturnType<typeof useApi>);
    mockPut.mockReturnValue({
      json: jest.fn().mockResolvedValue({
        script: 'const runInlineHook = () => ({ action: "updateUser" });',
        enabled: true,
        onExecutionError: 'block',
      }),
    });
    mockDelete.mockResolvedValue(undefined);
    mockShow.mockResolvedValue([true]);
  });

  it('renders empty placeholder for invalid route params', () => {
    mockedUseParams.mockReturnValue({ hookType: 'unknown', action: 'edit' });
    mockedUseDataFetch.mockReturnValue({
      isLoading: false,
      data: undefined,
      mutate: mockMutate,
      error: undefined,
    });

    render(<InlineHookDetails />);

    expect(screen.getByText('empty')).toBeTruthy();
  });

  it('shows the PostFirstFactorVerification security warning', () => {
    mockedUseParams.mockReturnValue({
      hookType: LogtoInlineHookKey.PostFirstFactorVerification,
      action: InlineHookAction.Create,
    });
    mockedUseDataFetch.mockReturnValue({
      isLoading: false,
      data: undefined,
      mutate: mockMutate,
      error: undefined,
    });

    render(<InlineHookDetails />);

    expect(screen.getByText('admin_console.inline_hooks.security_warning.title')).toBeTruthy();
    expect(
      screen.getByText('admin_console.inline_hooks.security_warning.description')
    ).toBeTruthy();
  });

  it('does not show the security warning on PostSignIn', () => {
    mockedUseParams.mockReturnValue({
      hookType: LogtoInlineHookKey.PostSignIn,
      action: InlineHookAction.Create,
    });
    mockedUseDataFetch.mockReturnValue({
      isLoading: false,
      data: undefined,
      mutate: mockMutate,
      error: undefined,
    });

    render(<InlineHookDetails />);

    expect(screen.queryByText('admin_console.inline_hooks.security_warning.title')).toBeNull();
  });

  it('shows empty state when editing a missing hook', () => {
    mockedUseParams.mockReturnValue({
      hookType: LogtoInlineHookKey.PostSignIn,
      action: InlineHookAction.Edit,
    });
    const notFoundError: RequestError = { status: 404, message: 'not found', name: 'RequestError' };
    mockedUseDataFetch.mockReturnValue({
      isLoading: false,
      data: undefined,
      mutate: mockMutate,
      error: notFoundError,
    });

    render(<InlineHookDetails />);

    expect(screen.getByText('empty')).toBeTruthy();
  });

  it('deletes a configured hook and invalidates cache', async () => {
    mockedUseParams.mockReturnValue({
      hookType: LogtoInlineHookKey.PostSignIn,
      action: InlineHookAction.Edit,
    });
    mockedUseDataFetch.mockReturnValue({
      isLoading: false,
      data: {
        script: 'const runInlineHook = () => ({ action: "updateUser" });',
        enabled: true,
        onExecutionError: 'block',
      },
      mutate: mockMutate,
      error: undefined,
    });

    render(<InlineHookDetails />);

    fireEvent.click(screen.getByRole('button', { name: 'general.delete' }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(getInlineHookApiPath(LogtoInlineHookKey.PostSignIn));
    });
    expect(mockGlobalMutate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(inlineHooksPath);
  });
});
