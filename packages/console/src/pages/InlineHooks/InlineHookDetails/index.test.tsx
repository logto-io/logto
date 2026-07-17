import { LogtoInlineHookKey } from '@logto/schemas';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';

import { type RequestError } from '@/hooks/use-api';

import { InlineHookAction } from '../types';

import InlineHookDetails from '.';
import useDataFetch from './use-data-fetch';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('./use-data-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
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

jest.mock('@/components/EmptyDataPlaceholder', () => ({
  __esModule: true,
  default: () => <div>empty</div>,
}));

jest.mock('@/ds-components/InlineNotification', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
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
const mockMutate = jest.fn();

describe('InlineHookDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(screen.getByText('main-content')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'general.delete' })).toBeNull();
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
    expect(screen.getByText('main-content')).toBeTruthy();
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
});
