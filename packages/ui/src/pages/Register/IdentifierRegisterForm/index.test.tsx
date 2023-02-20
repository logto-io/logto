import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, act, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { registerWithUsernamePassword } from '@/apis/interaction';
import { sendVerificationCodeApi } from '@/apis/utils';
import { UserFlow } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import IdentifierRegisterForm from '.';

const mockedNavigate = jest.fn();

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

const renderForm = (signUpMethods: SignInIdentifier[] = [SignInIdentifier.Username]) => {
  return renderWithPageContext(
    <SettingsProvider>
      <IdentifierRegisterForm signUpMethods={signUpMethods} />
    </SettingsProvider>
  );
};

describe('<IdentifierRegisterForm />', () => {
  afterEach(() => {
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
      expect(container.querySelector('input[name="identifier"]')).not.toBeNull();
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
      const usernameInput = container.querySelector('input[name="identifier"]');

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
      const usernameInput = container.querySelector('input[name="identifier"]');

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
      const { getByText, container } = renderForm();
      const submitButton = getByText('action.create_account');
      const termsButton = getByText('description.agree_with_terms');
      const usernameInput = container.querySelector('input[name="identifier"]');

      assert(usernameInput, new Error('username input not found'));

      act(() => {
        fireEvent.change(usernameInput, { target: { value: 'username' } });
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(registerWithUsernamePassword).not.toBeCalled();
      });

      act(() => {
        fireEvent.click(termsButton);
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
        const emailInput = container.querySelector('input[name="identifier"]');

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
        const emailInput = container.querySelector('input[name="identifier"]');

        assert(emailInput, new Error('email input not found'));

        act(() => {
          fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
          fireEvent.click(termsButton);
          fireEvent.submit(submitButton);
        });

        await waitFor(() => {
          expect(registerWithUsernamePassword).not.toBeCalled();
          expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.register, {
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
        const phoneInput = container.querySelector('input[name="identifier"]');

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
        const phoneInput = container.querySelector('input[name="identifier"]');

        assert(phoneInput, new Error('phone input not found'));

        act(() => {
          fireEvent.change(phoneInput, { target: { value: '8573333333' } });
          fireEvent.click(termsButton);
          fireEvent.submit(submitButton);
        });

        await waitFor(() => {
          expect(registerWithUsernamePassword).not.toBeCalled();
          expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.register, {
            phone: `${getDefaultCountryCallingCode()}8573333333`,
          });
        });
      });
    }
  );
});
