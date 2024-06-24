import resource from '@logto/phrases-experience';
import { SignInIdentifier } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import {
  verifyForgotPasswordVerificationCodeIdentifier,
  signInWithVerificationCodeIdentifier,
  addProfileWithVerificationCodeIdentifier,
} from '@/apis/interaction';
import { sendVerificationCodeApi } from '@/apis/utils';
import { setupI18nForTesting } from '@/jest.setup';
import { UserFlow } from '@/types';

import VerificationCode from '.';

jest.useFakeTimers();

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/utils', () => ({
  sendVerificationCodeApi: jest.fn(),
}));

jest.mock('@/apis/interaction', () => ({
  verifyForgotPasswordVerificationCodeIdentifier: jest.fn(),
  signInWithVerificationCodeIdentifier: jest.fn(),
  addProfileWithVerificationCodeIdentifier: jest.fn(),
}));

describe('<VerificationCode />', () => {
  const email = 'foo@logto.io';
  const phone = '18573333333';
  const originalLocation = window.location;

  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { replace: jest.fn() },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('render counter', () => {
    const { queryByText } = renderWithPageContext(
      <VerificationCode flow={UserFlow.SignIn} identifier={SignInIdentifier.Email} target={email} />
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
      <VerificationCode flow={UserFlow.SignIn} identifier={SignInIdentifier.Email} target={email} />
    );
    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });
    const resendButton = getByText('Resend verification code');

    await waitFor(() => {
      fireEvent.click(resendButton);
    });

    expect(sendVerificationCodeApi).toBeCalledWith(UserFlow.SignIn, { email });

    // Reset i18n
    await setupI18nForTesting();
  });

  describe('sign-in', () => {
    it('fire email sign-in validate verification code event', async () => {
      (signInWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.SignIn}
          identifier={SignInIdentifier.Email}
          target={email}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(signInWithVerificationCodeIdentifier).toBeCalledWith({
          email,
          verificationCode: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });

    it('fire phone sign-in validate verification code event', async () => {
      (signInWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.SignIn}
          identifier={SignInIdentifier.Phone}
          target={phone}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(signInWithVerificationCodeIdentifier).toBeCalledWith({
          phone,
          verificationCode: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });
  });

  describe('register', () => {
    it('fire email register validate verification code event', async () => {
      (addProfileWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Register}
          identifier={SignInIdentifier.Email}
          target={email}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithVerificationCodeIdentifier).toBeCalledWith({
          email,
          verificationCode: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });

    it('fire phone register validate verification code event', async () => {
      (addProfileWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Register}
          identifier={SignInIdentifier.Phone}
          target={phone}
        />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithVerificationCodeIdentifier).toBeCalledWith({
          phone,
          verificationCode: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });
  });

  describe('forgot password', () => {
    it('fire email forgot-password validate verification code event', async () => {
      (verifyForgotPasswordVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        success: true,
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.ForgotPassword}
          identifier={SignInIdentifier.Email}
          target={email}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(verifyForgotPasswordVerificationCodeIdentifier).toBeCalledWith({
          email,
          verificationCode: '111111',
        });
      });
    });

    it('fire phone forgot-password validate verification code event', async () => {
      (verifyForgotPasswordVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        success: true,
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.ForgotPassword}
          identifier={SignInIdentifier.Phone}
          target={phone}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(verifyForgotPasswordVerificationCodeIdentifier).toBeCalledWith({
          phone,
          verificationCode: '111111',
        });
      });
    });
  });

  describe('continue flow', () => {
    it('set email', async () => {
      (addProfileWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: '/redirect',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Continue}
          identifier={SignInIdentifier.Email}
          target={email}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithVerificationCodeIdentifier).toBeCalledWith({
          email,
          verificationCode: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('/redirect');
      });
    });

    it('set Phone', async () => {
      (addProfileWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: '/redirect',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          flow={UserFlow.Continue}
          identifier={SignInIdentifier.Phone}
          target={phone}
        />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithVerificationCodeIdentifier).toBeCalledWith({
          phone,
          verificationCode: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('/redirect');
      });
    });
  });
});
