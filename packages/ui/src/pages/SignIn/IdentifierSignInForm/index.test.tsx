import type { SignIn } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { mockSignInMethodSettingsTestCases } from '@/__mocks__/logto';
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

jest.mock('@/apis/utils', () => ({
  sendVerificationCodeApi: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const username = 'foo';
const email = 'foo@email.com';
const phone = '8573333333';

const renderForm = (signInMethods: SignIn['methods']) =>
  renderWithPageContext(
    <MemoryRouter>
      <IdentifierSignInForm signInMethods={signInMethods} />
    </MemoryRouter>
  );

describe('IdentifierSignInForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should show required error message when input is empty', async () => {
    const { getByText, container } = renderForm(mockSignInMethodSettingsTestCases[0]!);
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
            expect(mockedNavigate).toBeCalledWith(
              { pathname: 'password' },
              { state: { identifier: SignInIdentifier.Username, value } }
            );
          });

          return;
        }

        const signInMethod = signInMethods.find((method) => method.identifier === identifier);

        assert(signInMethod, new Error('invalid sign in method'));

        const { password, verificationCode, isPasswordPrimary } = signInMethod;

        if (password && (isPasswordPrimary || !verificationCode)) {
          await waitFor(() => {
            expect(sendVerificationCodeApi).not.toBeCalled();
            expect(mockedNavigate).toBeCalledWith(
              { pathname: 'password' },
              {
                state: {
                  identifier,
                  value:
                    identifier === SignInIdentifier.Phone
                      ? `${getDefaultCountryCallingCode()}${value}`
                      : value,
                },
              }
            );
          });

          return;
        }

        if (verificationCode) {
          await waitFor(() => {
            expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.signIn, {
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
});
