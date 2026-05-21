import resource from '@logto/phrases-experience';
import {
  AgreeToTermsPolicy,
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { act, fireEvent, waitFor, within } from '@testing-library/react';
import { HTTPError } from 'ky';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import {
  identifyWithVerificationCode,
  registerWithVerifiedIdentifier,
  updateProfileWithVerificationCode,
  sendVerificationCode,
} from '@/apis/experience';
import { setupI18nForTesting } from '@/jest.setup';
import { UserFlow } from '@/types';

import VerificationCode from '.';

jest.useFakeTimers();

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: jest.fn(() => ({
    state: {
      interactionEvent: InteractionEvent.SignIn,
    },
  })),
}));

jest.mock('@/apis/utils', () => ({
  ...jest.requireActual('@/apis/utils'),
  sendVerificationCodeApi: jest.fn(),
}));

jest.mock('@/apis/experience', () => ({
  sendVerificationCode: jest.fn(),
  identifyWithVerificationCode: jest.fn().mockResolvedValue({ redirectTo: '/redirect' }),
  registerWithVerifiedIdentifier: jest.fn().mockResolvedValue({ redirectTo: '/redirect' }),
  updateProfileWithVerificationCode: jest.fn().mockResolvedValue({ redirectTo: '/redirect' }),
}));

/**
 * Build a ky `HTTPError` carrying a Logto error code, so it is recognized by `useErrorHandler`
 * (which reads `error.response.json()`). A minimal fake response is enough here, since the
 * handler only relies on `instanceof HTTPError` and `response.json()`.
 */
const createRequestError = (code: string) => {
  const response = {
    status: 404,
    statusText: 'Not Found',
    json: async () => ({ code, message: code }),
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

const fillVerificationCode = (container: HTMLElement) => {
  for (const input of container.querySelectorAll('input')) {
    act(() => {
      fireEvent.input(input, { target: { value: '1' } });
    });
  }
};

describe('<VerificationCode />', () => {
  const redirectTo = '/redirect';
  const email = 'foo@logto.io';
  const phone = '18573333333';
  const originalLocation = window.location;
  const verificationId = '123456';

  const emailIdentifier: VerificationCodeIdentifier = {
    type: SignInIdentifier.Email,
    value: email,
  };

  const phoneIdentifier: VerificationCodeIdentifier = {
    type: SignInIdentifier.Phone,
    value: phone,
  };

  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { replace: jest.fn() },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('render counter', () => {
    const { queryByText } = renderWithPageContext(
      <VerificationCode
        flow={UserFlow.SignIn}
        identifier={emailIdentifier}
        verificationId={verificationId}
      />
    );

    expect(queryByText('description.resend_after_seconds')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });

    expect(queryByText('description.resend_passcode')).not.toBeNull();
  });

  it('fire resend event', async () => {
    /**
     * Apply the resource with resend_passcode for testing nested translation
     * Since the 'resend_passcode' phrase need be rendered into the following structure for testing:
     * ```
     * <div>Not received yet? <a>Resend verification code</a></div>
     * ```
     * otherwise this phrase will be rendered as 'description.resend_passcode'.
     * That will cause the resend button cannot be clicked.
     */
    await setupI18nForTesting({
      translation: {
        description: { resend_passcode: resource.en.translation.description.resend_passcode },
      },
    });

    const { getByText } = renderWithPageContext(
      <VerificationCode
        flow={UserFlow.SignIn}
        identifier={emailIdentifier}
        verificationId={verificationId}
      />
    );
    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });
    const resendButton = getByText('Resend verification code');

    await waitFor(() => {
      fireEvent.click(resendButton);
    });

    expect(sendVerificationCode).toBeCalledWith(InteractionEvent.SignIn, emailIdentifier);

    // Reset i18n
    await setupI18nForTesting();
  });

  describe('sign-in', () => {
    it('fire email sign-in validate verification code event', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.SignIn}
          identifier={emailIdentifier}
          verificationId={verificationId}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(identifyWithVerificationCode).toBeCalledWith({
          identifier: emailIdentifier,
          verificationId,
          code: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith(redirectTo);
      });
    });

    it('fire phone sign-in validate verification code event', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.SignIn}
          identifier={phoneIdentifier}
          verificationId={verificationId}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(identifyWithVerificationCode).toBeCalledWith({
          identifier: phoneIdentifier,
          verificationId,
          code: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith(redirectTo);
      });
    });
  });

  describe('register', () => {
    it('fire email register validate verification code event', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Register}
          identifier={emailIdentifier}
          verificationId={verificationId}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(identifyWithVerificationCode).toBeCalledWith({
          identifier: emailIdentifier,
          verificationId,
          code: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith(redirectTo);
      });
    });

    it('fire phone register validate verification code event', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Register}
          identifier={phoneIdentifier}
          verificationId={verificationId}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(identifyWithVerificationCode).toBeCalledWith({
          identifier: phoneIdentifier,
          verificationId,
          code: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith(redirectTo);
      });
    });
  });

  describe('forgot password', () => {
    it('fire email forgot-password validate verification code event', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.ForgotPassword}
          identifier={emailIdentifier}
          verificationId={verificationId}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(identifyWithVerificationCode).toBeCalledWith({
          identifier: emailIdentifier,
          verificationId,
          code: '111111',
        });
      });
    });

    it('fire phone forgot-password validate verification code event', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.ForgotPassword}
          identifier={phoneIdentifier}
          verificationId={verificationId}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(identifyWithVerificationCode).toBeCalledWith({
          identifier: phoneIdentifier,
          verificationId,
          code: '111111',
        });
      });
    });
  });

  describe('continue flow', () => {
    it('set email', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Continue}
          identifier={emailIdentifier}
          verificationId={verificationId}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(updateProfileWithVerificationCode).toBeCalledWith(
          {
            identifier: emailIdentifier,
            verificationId,
            code: '111111',
          },
          InteractionEvent.SignIn
        );
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith(redirectTo);
      });
    });

    it('set Phone', async () => {
      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Continue}
          identifier={phoneIdentifier}
          verificationId={verificationId}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(updateProfileWithVerificationCode).toBeCalledWith(
          {
            identifier: phoneIdentifier,
            verificationId,
            code: '111111',
          },
          InteractionEvent.SignIn
        );
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('/redirect');
      });
    });
  });

  describe('sign-in flow with an unregistered identifier', () => {
    const renderSignInToRegister = (identifier: VerificationCodeIdentifier) =>
      renderWithPageContext(
        <SettingsProvider
          settings={{
            ...mockSignInExperienceSettings,
            signUp: {
              ...mockSignInExperienceSettings.signUp,
              identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
            },
            // Require the agreement checkbox on registration only.
            agreeToTermsPolicy: AgreeToTermsPolicy.ManualRegistrationOnly,
          }}
        >
          <ConfirmModalProvider>
            <VerificationCode
              flow={UserFlow.SignIn}
              identifier={identifier}
              verificationId={verificationId}
            />
          </ConfirmModalProvider>
        </SettingsProvider>
      );

    /**
     * Drive the flow up to the terms agreement dialog: fail the sign-in with `user_not_exist`,
     * fill the code, confirm the "account does not exist" modal, and return the terms dialog.
     */
    const reachTermsDialog = async (identifier: VerificationCodeIdentifier) => {
      (identifyWithVerificationCode as jest.Mock).mockRejectedValueOnce(
        createRequestError('user.user_not_exist')
      );

      const { container, findByText } = renderSignInToRegister(identifier);

      fillVerificationCode(container);

      /**
       * The "account does not exist, create one?" confirmation modal shows up. Scope the lookup
       * to the dialog, since the page itself also renders an `action.continue` button.
       */
      const modalContent = await findByText('description.sign_in_id_does_not_exist');
      const dialog = modalContent.closest('[role="dialog"]');
      assert(dialog, new Error('confirmation dialog not found'));

      await act(async () => {
        fireEvent.click(within(dialog as HTMLElement).getByText('action.continue'));
      });

      // The terms agreement modal must be shown before the account is created.
      const termsContent = await findByText('description.agree_with_terms_modal');
      const termsDialog = termsContent.closest('[role="dialog"]');
      assert(termsDialog, new Error('terms agreement dialog not found'));
      expect(registerWithVerifiedIdentifier).not.toBeCalled();

      return termsDialog as HTMLElement;
    };

    it('prompts the terms agreement before creating the account under `ManualRegistrationOnly`', async () => {
      const termsDialog = await reachTermsDialog(emailIdentifier);

      /**
       * The dialog contains an icon-only close button, a cancel button, and the confirm (agree)
       * button. Select the confirm button by excluding the icon-only and cancel buttons, so the
       * test does not depend on button ordering.
       */
      const agreeButton = Array.from(termsDialog.querySelectorAll('button')).find(
        (button) => button.textContent && button.textContent !== 'action.cancel'
      );
      assert(agreeButton, new Error('agree button not found'));
      await act(async () => {
        fireEvent.click(agreeButton);
      });

      await waitFor(() => {
        expect(registerWithVerifiedIdentifier).toBeCalledWith(verificationId);
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith(redirectTo);
      });

      /**
       * Agreeing rebuilds the submission callback; the already-consumed code must not be
       * auto-submitted again, which would fail with `verification_code.not_found`.
       */
      expect(identifyWithVerificationCode).toHaveBeenCalledTimes(1);
    });

    it('navigates back without creating the account when the terms agreement is declined', async () => {
      const termsDialog = await reachTermsDialog(emailIdentifier);

      await act(async () => {
        fireEvent.click(within(termsDialog).getByText('action.cancel'));
      });

      /**
       * Declining the terms must not submit the registration. The verification code is already
       * consumed, so the user is navigated back instead of being left on a page where retrying
       * would fail with `verification_code.not_found`.
       */
      await waitFor(() => {
        expect(mockedNavigate).toBeCalledWith(-1);
      });
      expect(registerWithVerifiedIdentifier).not.toBeCalled();
    });
  });
});
