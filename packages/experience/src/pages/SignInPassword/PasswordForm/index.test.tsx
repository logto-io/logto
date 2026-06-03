import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import {
  signInWithPasswordIdentifier,
  initInteraction,
  sendVerificationCode,
} from '@/apis/experience';
import { UserFlow } from '@/types';

import PasswordForm from '.';

jest.mock('@/apis/experience', () => ({
  signInWithPasswordIdentifier: jest.fn(() => ({ redirectTo: '/' })),
  sendVerificationCode: jest.fn(() => ({ success: true })),
  initInteraction: jest.fn(() => ({ success: true })),
}));

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('PasswordSignInForm', () => {
  const username = 'foo';
  const email = 'foo@logto.io';
  const phone = '18573333333';
  const password = '111222';

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPasswordForm = (
    props: {
      identifier: SignInIdentifier;
      value: string;
      isVerificationCodeEnabled?: boolean;
    },
    settings?: Partial<typeof mockSignInExperienceSettings>
  ) =>
    renderWithPageContext(
      <SettingsProvider settings={{ ...mockSignInExperienceSettings, ...settings }}>
        <ConfirmModalProvider>
          <UserInteractionContextProvider>
            <PasswordForm {...props} />
          </UserInteractionContextProvider>
        </ConfirmModalProvider>
      </SettingsProvider>
    );

  test.each([
    { identifier: SignInIdentifier.Username, value: username, isVerificationCodeEnabled: false },
    { identifier: SignInIdentifier.Email, value: email, isVerificationCodeEnabled: true },
    { identifier: SignInIdentifier.Phone, value: phone, isVerificationCodeEnabled: true },
  ])(
    'Password SignInForm for %variable.identifier',
    async ({ identifier, value, isVerificationCodeEnabled }) => {
      const { getByText, queryByText, container } = renderPasswordForm({
        identifier,
        value,
        isVerificationCodeEnabled,
      });

      const submitButton = getByText('action.continue');

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(signInWithPasswordIdentifier).not.toBeCalled();
        expect(queryByText('error.password_required')).not.toBeNull();
      });

      const passwordInput = container.querySelector('input[name="password"]');

      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: password } });
      }

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(signInWithPasswordIdentifier).toBeCalledWith(
          {
            identifier: {
              type: identifier,
              value,
            },
            password,
          },
          undefined
        );
      });

      if (isVerificationCodeEnabled) {
        const sendVerificationCodeLink = getByText('action.sign_in_via_passcode');

        expect(sendVerificationCodeLink).not.toBeNull();

        act(() => {
          fireEvent.click(sendVerificationCodeLink);
        });

        await waitFor(() => {
          expect(initInteraction).toBeCalledWith(InteractionEvent.SignIn, undefined);
          expect(sendVerificationCode).toBeCalledWith(InteractionEvent.SignIn, {
            type: identifier,
            value,
          });
        });

        expect(mockedNavigate).toBeCalledWith(
          {
            pathname: `/${UserFlow.SignIn}/verification-code`,
          },
          {
            replace: true,
          }
        );
      }
    }
  );

  test('should ignore password expiration reminder and continue sign-in', async () => {
    (signInWithPasswordIdentifier as jest.Mock).mockResolvedValueOnce({
      redirectTo: '/',
      reminder: {
        daysUntilExpiration: 1,
      },
    });

    const { getByText, queryByText, container } = renderPasswordForm(
      {
        identifier: SignInIdentifier.Email,
        value: email,
        isVerificationCodeEnabled: true,
      },
      {
        forgotPassword: { email: true, phone: false },
      }
    );

    const submitButton = getByText('action.continue');
    const passwordInput = container.querySelector('input[name="password"]');

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: password } });
    }

    act(() => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(signInWithPasswordIdentifier).toBeCalled();
    });

    expect(queryByText('description.password_expiration_reminder')).toBeNull();
    expect(queryByText('description.password_expiration_reminder_skip')).toBeNull();
  });
});
