import resource from '@logto/phrases-experience';
import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import {
  identifyWithVerificationCode,
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
  updateProfileWithVerificationCode: jest.fn().mockResolvedValue({ redirectTo: '/redirect' }),
}));

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
});
