import { SignInIdentifier, experience, type SsoConnectorMetadata } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, act, waitFor, renderHook } from '@testing-library/react';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, mockSsoConnectors } from '@/__mocks__/logto';
import { registerWithUsernamePassword } from '@/apis/interaction';
import { sendVerificationCodeApi } from '@/apis/utils';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { UserFlow } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import IdentifierRegisterForm from '.';

const mockedNavigate = jest.fn();
const getSingleSignOnConnectorsMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('@/apis/utils', () => ({
  sendVerificationCodeApi: jest.fn(),
}));

jest.mock('@/apis/interaction', () => ({
  registerWithUsernamePassword: jest.fn(async () => ({})),
}));

jest.mock('@/apis/single-sign-on', () => ({
  getSingleSignOnConnectors: (email: string) => getSingleSignOnConnectorsMock(email),
}));

const renderForm = (
  signUpMethods: SignInIdentifier[] = [SignInIdentifier.Username],
  ssoConnectors: SsoConnectorMetadata[] = []
) => {
  return renderWithPageContext(
    <SettingsProvider
      settings={{
        ...mockSignInExperienceSettings,
        ssoConnectors,
      }}
    >
      <ConfirmModalProvider>
        <UserInteractionContextProvider>
          <SingleSignOnFormModeContextProvider>
            <IdentifierRegisterForm signUpMethods={signUpMethods} />
          </SingleSignOnFormModeContextProvider>
        </UserInteractionContextProvider>
      </ConfirmModalProvider>
    </SettingsProvider>
  );
};

describe('<IdentifierRegisterForm />', () => {
  afterEach(() => {
    /**
     * Clear the session storage for each test to avoid test pollution
     * since the registration follow will  store the current identifier
     */
    const { result } = renderHook(() => useSessionStorage());
    const { remove } = result.current;

    remove(StorageKeys.IdentifierInputValue);
    jest.clearAllMocks();
  });

  describe.each([
    [SignInIdentifier.Username],
    [SignInIdentifier.Email],
    [SignInIdentifier.Phone],
    [SignInIdentifier.Email, SignInIdentifier.Phone],
  ])('%p %p register form', (...signUpMethods) => {
    test('default render', () => {
      const { queryByText, container } = renderForm(signUpMethods);
      expect(container.querySelector('input[name=identifier]')).not.toBeNull();
      expect(queryByText('action.create_account')).not.toBeNull();
      expect(queryByText('description.terms_of_use')).not.toBeNull();
    });

    test('identifier are required', async () => {
      const { queryByText, getByText } = renderForm(signUpMethods);
      const submitButton = getByText('action.create_account');

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(queryByText('error.general_required')).not.toBeNull();
        expect(registerWithUsernamePassword).not.toBeCalled();
        expect(sendVerificationCodeApi).not.toBeCalled();
      });
    });
  });

  describe('username register form', () => {
    test('username with initial numeric char should throw', async () => {
      const { queryByText, getByText, container } = renderForm();
      const submitButton = getByText('action.create_account');
      const usernameInput = container.querySelector('input[name=identifier]');

      assert(usernameInput, new Error('username input not found'));

      act(() => {
        fireEvent.change(usernameInput, { target: { value: '1username' } });
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(queryByText('error.username_should_not_start_with_number')).not.toBeNull();
        expect(registerWithUsernamePassword).not.toBeCalled();
      });

      act(() => {
        fireEvent.change(usernameInput, { target: { value: 'username' } });
        fireEvent.blur(usernameInput);
      });

      await waitFor(() => {
        expect(queryByText('error.username_should_not_start_with_number')).toBeNull();
      });
    });

    test('username with special character should throw', async () => {
      const { queryByText, getByText, container } = renderForm();
      const submitButton = getByText('action.create_account');
      const usernameInput = container.querySelector('input[name=identifier]');

      assert(usernameInput, new Error('username input not found'));

      act(() => {
        fireEvent.change(usernameInput, { target: { value: '@username' } });
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(queryByText('error.username_invalid_charset')).not.toBeNull();
        expect(registerWithUsernamePassword).not.toBeCalled();
      });

      act(() => {
        fireEvent.change(usernameInput, { target: { value: 'username' } });
        fireEvent.blur(usernameInput);
      });

      await waitFor(() => {
        expect(queryByText('error.username_invalid_charset')).toBeNull();
      });
    });

    test('submit properly', async () => {
      const { getByText, queryByText, container } = renderForm();
      const submitButton = getByText('action.create_account');
      const termsButton = getByText('description.agree_with_terms');
      const usernameInput = container.querySelector('input[name=identifier]');

      assert(usernameInput, new Error('username input not found'));

      act(() => {
        fireEvent.change(usernameInput, { target: { value: 'username' } });
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(queryByText('description.agree_with_terms_modal')).not.toBeNull();
        expect(registerWithUsernamePassword).not.toBeCalled();
      });

      act(() => {
        fireEvent.click(termsButton);
      });

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(registerWithUsernamePassword).toBeCalledWith('username');
      });
    });
  });

  describe.each([[SignInIdentifier.Email], [SignInIdentifier.Email, SignInIdentifier.Phone]])(
    'email register form with sign up settings %o',
    (...signUpMethods) => {
      test('email with invalid format should throw', async () => {
        const { queryByText, getByText, container } = renderForm(signUpMethods);

        const submitButton = getByText('action.create_account');
        const emailInput = container.querySelector('input[name=identifier]');

        assert(emailInput, new Error('email input not found'));

        act(() => {
          fireEvent.change(emailInput, { target: { value: 'invalid' } });
          fireEvent.submit(submitButton);
        });

        await waitFor(() => {
          expect(queryByText('error.invalid_email')).not.toBeNull();
          expect(registerWithUsernamePassword).not.toBeCalled();
          expect(sendVerificationCodeApi).not.toBeCalled();
        });

        act(() => {
          fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
          fireEvent.blur(emailInput);
        });

        await waitFor(() => {
          expect(queryByText('error.invalid_email')).toBeNull();
        });
      });

      test('submit properly', async () => {
        const { getByText, container } = renderForm(signUpMethods);

        const submitButton = getByText('action.create_account');
        const termsButton = getByText('description.agree_with_terms');
        const emailInput = container.querySelector('input[name=identifier]');

        assert(emailInput, new Error('email input not found'));

        act(() => {
          fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
          fireEvent.click(termsButton);
        });

        act(() => {
          fireEvent.submit(submitButton);
        });

        await waitFor(() => {
          expect(registerWithUsernamePassword).not.toBeCalled();
          expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.Register, {
            email: 'foo@logto.io',
          });
        });
      });
    }
  );

  describe.each([[SignInIdentifier.Phone], [SignInIdentifier.Email, SignInIdentifier.Phone]])(
    'phone register form with sign up settings %o',
    (...signUpMethods) => {
      test('phone with invalid format should throw', async () => {
        const { queryByText, getByText, container } = renderForm(signUpMethods);

        const submitButton = getByText('action.create_account');
        const phoneInput = container.querySelector('input[name=identifier]');

        assert(phoneInput, new Error('phone input not found'));

        act(() => {
          fireEvent.change(phoneInput, { target: { value: '1234' } });
          fireEvent.submit(submitButton);
        });

        await waitFor(() => {
          expect(queryByText('error.invalid_phone')).not.toBeNull();
          expect(registerWithUsernamePassword).not.toBeCalled();
          expect(sendVerificationCodeApi).not.toBeCalled();
        });

        act(() => {
          fireEvent.change(phoneInput, { target: { value: '8573333333' } });
          fireEvent.blur(phoneInput);
        });

        await waitFor(() => {
          expect(queryByText('error.invalid_phone')).toBeNull();
        });
      });
      test('submit properly', async () => {
        const { getByText, container } = renderForm(signUpMethods);

        const submitButton = getByText('action.create_account');
        const termsButton = getByText('description.agree_with_terms');
        const phoneInput = container.querySelector('input[name=identifier]');

        assert(phoneInput, new Error('phone input not found'));

        act(() => {
          fireEvent.change(phoneInput, { target: { value: '8573333333' } });
          fireEvent.click(termsButton);
        });

        act(() => {
          fireEvent.submit(submitButton);
        });

        await waitFor(() => {
          expect(registerWithUsernamePassword).not.toBeCalled();
          expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.Register, {
            phone: `${getDefaultCountryCallingCode()}8573333333`,
          });
        });
      });
    }
  );

  describe('single sign on register form', () => {
    const email = 'foo@email.com';

    const { result } = renderHook(() => useSessionStorage());

    const { remove } = result.current;

    afterEach(() => {
      remove(StorageKeys.IdentifierInputValue);
    });

    it('should not call check single sign-on connector when no single sign-on connector is enabled', async () => {
      const { getByText, container, queryByText } = renderForm([SignInIdentifier.Email]);
      const submitButton = getByText('action.create_account');
      const emailInput = container.querySelector('input[name=identifier]');
      const termsButton = getByText('description.agree_with_terms');

      assert(emailInput, new Error('username input not found'));

      act(() => {
        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.click(termsButton);
      });

      expect(queryByText('action.single_sign_on')).toBeNull();

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(getSingleSignOnConnectorsMock).not.toBeCalled();
        expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.Register, {
          email,
        });
      });
    });

    it('should call check single sign-on connector when the identifier is email, but process to password sign-in if no sso connector is matched', async () => {
      getSingleSignOnConnectorsMock.mockRejectedValueOnce([]);

      const { getByText, container, queryByText } = renderForm(
        [SignInIdentifier.Email],
        mockSsoConnectors
      );
      const submitButton = getByText('action.create_account');
      const emailInput = container.querySelector('input[name=identifier]');
      const termsButton = getByText('description.agree_with_terms');

      assert(emailInput, new Error('username input not found'));

      act(() => {
        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.click(termsButton);
      });

      await waitFor(() => {
        expect(getSingleSignOnConnectorsMock).toBeCalledWith(email);
      });

      act(() => {
        fireEvent.submit(submitButton);
      });

      // Should not switch to the single sign-on mode
      expect(queryByText('action.single_sign_on')).toBeNull();

      await waitFor(() => {
        expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.Register, {
          email,
        });
      });
    });

    it('should call check single sign-on connector when the identifier is email, and goes to the SSO flow', async () => {
      getSingleSignOnConnectorsMock.mockResolvedValueOnce(mockSsoConnectors.map(({ id }) => id));

      const { getByText, container, queryByText } = renderForm(
        [SignInIdentifier.Email],
        mockSsoConnectors
      );
      const emailInput = container.querySelector('input[name=identifier]');
      const termsButton = getByText('description.agree_with_terms');

      assert(emailInput, new Error('username input not found'));

      act(() => {
        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.click(termsButton);
      });

      await waitFor(() => {
        expect(getSingleSignOnConnectorsMock).toBeCalledWith(email);
      });

      await waitFor(() => {
        // Should switch to the single sign-on mode
        expect(queryByText('action.single_sign_on')).not.toBeNull();
        expect(queryByText('action.create_account')).toBeNull();
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
