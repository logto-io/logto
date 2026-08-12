import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';

import { Action } from '../CustomizeJwt/utils/type';

import CustomizeJwtDetails from '.';
import useDataFetch from './use-data-fetch';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('./use-data-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockIsCloud = jest.fn(() => false);
const mockIsDevFeaturesEnabled = jest.fn(() => true);

jest.mock('@/consts/env', () => ({
  get isCloud() {
    return mockIsCloud();
  },
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

jest.mock('@/components/DetailsPage', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
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

describe('CustomizeJwtDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCloud.mockReturnValue(false);
    mockIsDevFeaturesEnabled.mockReturnValue(true);
    mockedUseParams.mockReturnValue({
      tokenType: LogtoJwtTokenKeyType.AccessToken,
      action: Action.Create,
    });
    mockedUseDataFetch.mockReturnValue({
      isLoading: false,
      data: undefined,
      mutate: mockMutate,
      error: undefined,
    });
  });

  it('renders empty placeholder for invalid route params', () => {
    mockedUseParams.mockReturnValue({ tokenType: 'unknown', action: 'edit' });

    render(<CustomizeJwtDetails />);

    expect(screen.getByText('empty')).toBeTruthy();
  });

  it('shows the sandbox warning for self-hosted tenants when dev features are enabled', () => {
    render(<CustomizeJwtDetails />);

    expect(screen.getByText('admin_console.jwt_claims.sandbox_warning.title')).toBeTruthy();
    expect(screen.getByText('admin_console.jwt_claims.sandbox_warning.description')).toBeTruthy();
    expect(screen.getByText('main-content')).toBeTruthy();
  });

  it('hides the sandbox warning for Cloud tenants', () => {
    mockIsCloud.mockReturnValue(true);

    render(<CustomizeJwtDetails />);

    expect(screen.queryByText('admin_console.jwt_claims.sandbox_warning.title')).toBeNull();
    expect(screen.getByText('main-content')).toBeTruthy();
  });

  it('hides the sandbox warning when dev features are disabled', () => {
    mockIsDevFeaturesEnabled.mockReturnValue(false);

    render(<CustomizeJwtDetails />);

    expect(screen.queryByText('admin_console.jwt_claims.sandbox_warning.title')).toBeNull();
    expect(screen.getByText('main-content')).toBeTruthy();
  });
});
