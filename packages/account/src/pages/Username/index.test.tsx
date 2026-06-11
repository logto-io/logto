import { AccountCenterControlValue, type AccountCenter, type UsernamePolicy } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
} from '@ac/__mocks__/RenderWithPageContext';

import { updateUsername } from '../../apis/account';

import Username from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('../../apis/account', () => ({
  updateUsername: jest.fn(),
}));

// The policy gate is read per submit; control it per test (and sidestep `import.meta.env`). Default
// off — matching production and the suite's original hard-floor-only behavior; the policy block
// turns it on.
const mockIsDevFeaturesEnabled = jest.fn(() => false);
jest.mock('@ac/constants/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

jest.mock('@ac/components/VerificationMethodList', () => () => <div>Verification methods</div>);

// Lowercase-only, length 4–8: violations here are policy-only (not caught by the hard floor).
const restrictivePolicy: UsernamePolicy = {
  caseSensitive: true,
  minLength: 4,
  maxLength: 8,
  allowedChars: { lowercase: true, uppercase: false, numbers: false, underscore: false },
};

const createHttpError = (code: string, status: number) =>
  new HTTPError(
    {
      status,
      json: async () => ({ code, message: code }),
    } as Response,
    {} as Request,
    {} as NormalizedOptions
  );

type UsernameRenderOptions = {
  readonly pageContext?: Omit<Partial<PageContextType>, 'accountCenterSettings'> & {
    readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
      readonly fields?: Partial<AccountCenter['fields']>;
    };
  };
};

const renderUsername = ({ pageContext }: UsernameRenderOptions = {}) =>
  renderWithPageContext(
    <Routes>
      <Route path="/username" element={<Username />} />
      <Route path="/username/success" element={<div>Success page</div>} />
    </Routes>,
    {
      initialEntries: ['/username'],
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    },
    {
      pageContext: {
        ...pageContext,
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          ...pageContext?.accountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            ...pageContext?.accountCenterSettings?.fields,
          },
        },
        verificationId:
          pageContext && 'verificationId' in pageContext
            ? pageContext.verificationId
            : 'verification-record-id',
      },
    }
  );

const renderWithPolicy = () =>
  renderUsername({
    pageContext: {
      experienceSettings: { ...mockSignInExperienceSettings, usernamePolicy: restrictivePolicy },
    },
  });

describe('<Username />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    jest.mocked(updateUsername).mockResolvedValue(undefined);
    mockIsDevFeaturesEnabled.mockReturnValue(false);
  });

  it('shows an error page when username editing is disabled', () => {
    const { getByText } = renderUsername({
      pageContext: {
        accountCenterSettings: {
          fields: {
            username: AccountCenterControlValue.ReadOnly,
          },
        },
      },
    });

    expect(getByText('error.feature_not_enabled')).toBeTruthy();
  });

  it('shows verification methods when identity is not verified', () => {
    const { getByText } = renderUsername({
      pageContext: {
        verificationId: undefined,
      },
    });

    expect(getByText('Verification methods')).toBeTruthy();
  });

  it('updates username and navigates to the success page', async () => {
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
    const { getByText, container } = renderUsername({
      pageContext: {
        refreshUserInfo,
      },
    });

    const usernameInput = container.querySelector('input[name="username"]');
    fireEvent.change(usernameInput!, { target: { value: 'new_username' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(updateUsername).toHaveBeenCalledWith('access-token', 'verification-record-id', {
        username: 'new_username',
      });
    });
    expect(refreshUserInfo).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(getByText('Success page')).toBeTruthy();
    });
  });

  it('shows a validation error when username is empty', async () => {
    const { getByText, container } = renderUsername();

    const usernameInput = container.querySelector('input[name="username"]');
    fireEvent.change(usernameInput!, { target: { value: '   ' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(getByText('error.username_required')).toBeTruthy();
    });
    expect(updateUsername).not.toHaveBeenCalled();
  });

  it('shows a validation error when username starts with a number', async () => {
    const { getByText, container } = renderUsername();

    const usernameInput = container.querySelector('input[name="username"]');
    fireEvent.change(usernameInput!, { target: { value: '1invalid' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(getByText('error.username_should_not_start_with_number')).toBeTruthy();
    });
    expect(updateUsername).not.toHaveBeenCalled();
  });

  it('shows a toast when the username is already in use', async () => {
    const setToast = jest.fn();
    jest
      .mocked(updateUsername)
      .mockRejectedValue(createHttpError('user.username_already_in_use', 422));

    const { getByText, container } = renderUsername({
      pageContext: {
        setToast,
      },
    });

    const usernameInput = container.querySelector('input[name="username"]');
    fireEvent.change(usernameInput!, { target: { value: 'taken_username' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith('error.username_exists');
    });
  });

  it('clears verification and prompts re-verification when permission is denied', async () => {
    const setVerificationId = jest.fn();
    const setToast = jest.fn();
    jest
      .mocked(updateUsername)
      .mockRejectedValue(createHttpError('verification_record.permission_denied', 401));

    const { getByText, container } = renderUsername({
      pageContext: {
        setVerificationId,
        setToast,
      },
    });

    const usernameInput = container.querySelector('input[name="username"]');
    fireEvent.change(usernameInput!, { target: { value: 'new_username' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(setVerificationId).toHaveBeenCalledWith(undefined);
      expect(setToast).toHaveBeenCalledWith('account_center.verification.verification_required');
    });
  });

  describe('username policy', () => {
    beforeEach(() => {
      mockIsDevFeaturesEnabled.mockReturnValue(true);
    });

    it('blocks a too-short username with an inline policy error', async () => {
      const { getByText, container } = renderWithPolicy();

      const usernameInput = container.querySelector('input[name="username"]');
      fireEvent.change(usernameInput!, { target: { value: 'abc' } });
      fireEvent.click(getByText('action.save'));

      await waitFor(() => {
        expect(getByText('error.username_too_short')).toBeTruthy();
      });
      expect(updateUsername).not.toHaveBeenCalled();
    });

    it('blocks a username with a disallowed character class', async () => {
      const { getByText, container } = renderWithPolicy();

      const usernameInput = container.querySelector('input[name="username"]');
      fireEvent.change(usernameInput!, { target: { value: 'abcD' } });
      fireEvent.click(getByText('action.save'));

      await waitFor(() => {
        expect(getByText('error.username_uppercase_not_allowed')).toBeTruthy();
      });
      expect(updateUsername).not.toHaveBeenCalled();
    });

    it('submits a policy-compliant username', async () => {
      const { getByText, container } = renderWithPolicy();

      const usernameInput = container.querySelector('input[name="username"]');
      fireEvent.change(usernameInput!, { target: { value: 'abcd' } });
      fireEvent.click(getByText('action.save'));

      await waitFor(() => {
        expect(updateUsername).toHaveBeenCalledWith('access-token', 'verification-record-id', {
          username: 'abcd',
        });
      });
    });

    // The test i18n returns the key, so the rendered description surfaces as its phrase key.
    it('swaps the page description to the policy requirements for a restrictive policy', () => {
      const { getByText, queryByText } = renderWithPolicy();
      expect(getByText('account_center.username.policy_description')).toBeTruthy();
      expect(queryByText('account_center.username.description')).toBeNull();
    });

    it('keeps the static page description for the permissive default policy', () => {
      const { getByText, queryByText } = renderUsername();
      expect(getByText('account_center.username.description')).toBeTruthy();
      expect(queryByText('account_center.username.policy_description')).toBeNull();
    });

    it('keeps the static page description when dev features are off', () => {
      mockIsDevFeaturesEnabled.mockReturnValue(false);
      const { getByText, queryByText } = renderWithPolicy();
      expect(getByText('account_center.username.description')).toBeTruthy();
      expect(queryByText('account_center.username.policy_description')).toBeNull();
    });

    it('does not block a policy-only violation when dev features are off', async () => {
      mockIsDevFeaturesEnabled.mockReturnValue(false);
      const { getByText, container } = renderWithPolicy();

      // 'abc' is too short for the policy but passes the always-on hard floor, so with the gate off
      // it submits unchanged — proving the policy is not enforced client-side in production.
      const usernameInput = container.querySelector('input[name="username"]');
      fireEvent.change(usernameInput!, { target: { value: 'abc' } });
      fireEvent.click(getByText('action.save'));

      await waitFor(() => {
        expect(updateUsername).toHaveBeenCalledWith('access-token', 'verification-record-id', {
          username: 'abc',
        });
      });
    });
  });
});
