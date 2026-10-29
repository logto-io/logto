import { AccountCenterControlValue } from '@logto/schemas';
import { waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';

import renderWithPageContext, {
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { getBackupCodesList } from '@ac/apis/mfa';

import BackupCodeView from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockSignIn = jest.fn();
const mockUseStepUpEntry = jest.fn();

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    signIn: mockSignIn,
  }),
}));

jest.mock('@ac/hooks/use-step-up', () => {
  const actual = jest.requireActual<Record<string, unknown>>('@ac/hooks/use-step-up');

  return {
    __esModule: true,
    ...actual,
    useStepUpEntry: () => mockUseStepUpEntry(),
  };
});

jest.mock('@ac/apis/mfa', () => ({
  getBackupCodesList: jest.fn(),
}));

jest.mock('@ac/components/ErrorPage', () => ({
  __esModule: true,
  default: ({ titleKey }: { titleKey?: string }) => <div>{titleKey}</div>,
}));

const challenge =
  'Bearer error="insufficient_user_authentication", ' +
  'error_description="Recent user authentication is required", ' +
  'acr_values="urn:logto:acr:1fa", max_age="600"';

const createChallengeError = () =>
  new HTTPError(
    {
      status: 401,
      headers: {
        get: (name: string) => (name === 'www-authenticate' ? challenge : null),
      },
      json: async () => ({
        code: 'verification_record.permission_denied',
        message: 'Permission denied, please re-authenticate.',
      }),
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const renderBackupCodeView = () =>
  renderWithPageContext(
    <BackupCodeView />,
    {
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            mfa: AccountCenterControlValue.Edit,
          },
        },
      },
    }
  );

describe('<BackupCodeView /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockSignIn.mockResolvedValue(undefined);
    mockUseStepUpEntry.mockReturnValue({
      isReady: true,
      isChecking: false,
      hasFailed: false,
      isResumed: true,
      verificationId: undefined,
    });
    jest.mocked(getBackupCodesList).mockRejectedValue(createChallengeError());
  });

  it('shows an error instead of starting another step-up when a resumed read is challenged again', async () => {
    const { getByText } = renderBackupCodeView();

    await waitFor(() => {
      expect(getByText('error.something_went_wrong')).toBeTruthy();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
