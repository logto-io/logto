import type { SignIn, SsoConnectorMetadata } from '@logto/schemas';
import { SignInIdentifier, experience } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, act, waitFor } from '@testing-library/react';

import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import {
  mockSignInMethodSettingsTestCases,
  mockSignInExperienceSettings,
  mockSsoConnectors,
} from '@/__mocks__/logto';
import { sendVerificationCodeApi } from '@/apis/utils';
import { UserFlow } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import IdentifierSignInForm from './index';

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
  t: (key: string) => key,
}));

const mockedNavigate = jest.fn();
const getSingleSignOnConnectorsMock = jest.fn();

jest.mock('@/apis/utils', () => ({
  sendVerificationCodeApi: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/single-sign-on', () => ({
  getSingleSignOnConnectors: (email: string) => getSingleSignOnConnectorsMock(email),
}));

const username = 'foo';
const email = 'foo@email.com';
const phone = '8573333333';

const renderForm = (signInMethods: SignIn['methods'], ssoConnectors: SsoConnectorMetadata[] = []) =>
  renderWithPageContext(
    <SettingsProvider
      settings={{
        ...mockSignInExperienceSettings,
        ssoConnectors,
      }}
    >
      <UserInteractionContextProvider>
        <SingleSignOnFormModeContextProvider>
          <IdentifierSignInForm signInMethods={signInMethods} />
        </SingleSignOnFormModeContextProvider>
      </UserInteractionContextProvider>
    </SettingsProvider>
  );

describe('IdentifierSignInForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should show required error message when input is empty', async () => {
    const { getByText } = renderForm(mockSignInMethodSettingsTestCases[0]!);
    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(getByText('error.general_required')).not.toBeNull();
    });
  });

  test.each(['0foo', ' foo@', '85711'])(
    `should show error message when with invalid input %p`,
    async (input) => {
      const { getByText, container } = renderForm(mockSignInMethodSettingsTestCases[0]!);

      const inputField = container.querySelector('input[name="identifier"]');
      const submitButton = getByText('action.sign_in');

      if (inputField) {
        act(() => {
          fireEvent.change(inputField, { target: { value: input } });
        });
      }

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(getByText('error.general_invalid')).not.toBeNull();
      });
    }
  );

  describe.each(mockSignInMethodSettingsTestCases)(
    'render IdentifierSignInForm with [%p, %p, %p]',
    (...signInMethods) => {
      test.each([
        [SignInIdentifier.Username, username],
        [SignInIdentifier.Email, email],
        [SignInIdentifier.Phone, phone],
      ])('sign in with %p', async (identifier, value) => {
        const { getByText, container } = renderForm(signInMethods);

        const inputField = container.querySelector('input[name="identifier"]');
        const submitButton = getByText('action.sign_in');

        if (inputField) {
          act(() => {
            fireEvent.change(inputField, { target: { value } });
          });
        }

        act(() => {
          fireEvent.submit(submitButton);
        });

        if (identifier === SignInIdentifier.Username) {
          await waitFor(() => {
            expect(sendVerificationCodeApi).not.toBeCalled();
            expect(mockedNavigate).toBeCalledWith({ pathname: '/sign-in/password' });
          });

          return;
        }

        const signInMethod = signInMethods.find((method) => method.identifier === identifier);

        assert(signInMethod, new Error('invalid sign in method'));

        const { password, verificationCode, isPasswordPrimary } = signInMethod;

        if (password && (isPasswordPrimary || !verificationCode)) {
          await waitFor(() => {
            expect(sendVerificationCodeApi).not.toBeCalled();
            expect(mockedNavigate).toBeCalledWith({ pathname: '/sign-in/password' });
          });

          return;
        }

        if (verificationCode) {
          await waitFor(() => {
            expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.SignIn, {
              [identifier]:
                identifier === SignInIdentifier.Phone
                  ? `${getDefaultCountryCallingCode()}${value}`
                  : value,
            });
            expect(mockedNavigate).not.toBeCalled();
          });
        }
      });
    }
  );

  describe('email single sign-on tests', () => {
    it('should not call check single sign-on connector when the identifier is not email', async () => {
      const { getByText, container, queryByText } = renderForm(
        mockSignInMethodSettingsTestCases[0]!,
        mockSsoConnectors
      );

      const inputField = container.querySelector('input[name="identifier"]');
      const submitButton = getByText('action.sign_in');

      if (inputField) {
        act(() => {
          fireEvent.change(inputField, { target: { value: username } });
        });
      }

      expect(queryByText('action.sign_in')).not.toBeNull();
      expect(queryByText('action.single_sign_on')).toBeNull();

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(getSingleSignOnConnectorsMock).not.toBeCalled();
        expect(mockedNavigate).toBeCalledWith({ pathname: '/sign-in/password' });
      });
    });

    it('should not call check single sign-on connector when no single sign-on connector is enabled', async () => {
      const { getByText, container, queryByText } = renderForm(
        mockSignInMethodSettingsTestCases[0]!
      );

      const inputField = container.querySelector('input[name="identifier"]');
      const submitButton = getByText('action.sign_in');

      if (inputField) {
        act(() => {
          fireEvent.change(inputField, { target: { value: email } });
        });
      }

      expect(queryByText('action.sign_in')).not.toBeNull();
      expect(queryByText('action.single_sign_on')).toBeNull();

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(getSingleSignOnConnectorsMock).not.toBeCalled();
        expect(mockedNavigate).toBeCalledWith({ pathname: '/sign-in/password' });
      });
    });

    it('should call check single sign-on connector when the identifier is email, but process to password sign-in if no sso connector is matched', async () => {
      getSingleSignOnConnectorsMock.mockResolvedValueOnce([]);

      const { getByText, container, queryByText } = renderForm(
        mockSignInMethodSettingsTestCases[0]!,
        mockSsoConnectors
      );

      const inputField = container.querySelector('input[name="identifier"]');

      if (inputField) {
        act(() => {
          fireEvent.change(inputField, { target: { value: email } });
        });
      }

      await waitFor(() => {
        expect(getSingleSignOnConnectorsMock).toBeCalledWith(email);
      });

      // Should not switch to the single sign-on mode
      expect(queryByText('action.single_sign_on')).toBeNull();

      const submitButton = getByText('action.sign_in');

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(mockedNavigate).toBeCalledWith({ pathname: '/sign-in/password' });
      });
    });

    it('should call check single sign-on connector when the identifier is email, and process to single sign-on if a sso connector is matched', async () => {
      getSingleSignOnConnectorsMock.mockResolvedValueOnce(mockSsoConnectors.map(({ id }) => id));

      const { getByText, container, queryByText } = renderForm(
        mockSignInMethodSettingsTestCases[0]!,
        mockSsoConnectors
      );

      const inputField = container.querySelector('input[name="identifier"]');

      if (inputField) {
        act(() => {
          fireEvent.change(inputField, { target: { value: email } });
        });
      }

      await waitFor(() => {
        expect(getSingleSignOnConnectorsMock).toBeCalledWith(email);
      });

      await waitFor(() => {
        // Should switch to the single sign-on mode
        expect(queryByText('action.single_sign_on')).not.toBeNull();
        expect(queryByText('action.sign_in')).toBeNull();
      });

      act(() => {
        const submitButton = getByText('action.single_sign_on');
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(mockedNavigate).toBeCalledWith(`/${experience.routes.sso}/connectors`);
      });
    });
  });
});
