import { SignInIdentifier } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import {
  verifyForgotPasswordVerificationCodeIdentifier,
  signInWithVerificationCodeIdentifier,
  addProfileWithVerificationCodeIdentifier,
} from '@/apis/interaction';
import { UserFlow } from '@/types';

import VerificationCode from '.';

jest.useFakeTimers();

const sendVerificationCodeApi = jest.fn();

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/utils', () => ({
  getSendVerificationCodeApi: () => sendVerificationCodeApi,
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
      <VerificationCode type={UserFlow.signIn} method={SignInIdentifier.Email} target={email} />
    );

    expect(queryByText('description.resend_after_seconds')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });

    expect(queryByText('description.resend_passcode')).not.toBeNull();
  });

  it('fire resend event', async () => {
    const { getByText } = renderWithPageContext(
      <VerificationCode type={UserFlow.signIn} method={SignInIdentifier.Email} target={email} />
    );
    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });
    const resendButton = getByText('description.resend_passcode');

    await waitFor(() => {
      fireEvent.click(resendButton);
    });

    expect(sendVerificationCodeApi).toBeCalledWith({ email });
  });

  describe('sign-in', () => {
    it('fire email sign-in validate verification code event', async () => {
      (signInWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode type={UserFlow.signIn} method={SignInIdentifier.Email} target={email} />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(signInWithVerificationCodeIdentifier).toBeCalledWith(
          { email, verificationCode: '111111' },
          undefined
        );
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
        <VerificationCode type={UserFlow.signIn} method={SignInIdentifier.Phone} target={phone} />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(signInWithVerificationCodeIdentifier).toBeCalledWith(
          {
            phone,
            verificationCode: '111111',
          },
          undefined
        );
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
        <VerificationCode type={UserFlow.register} method={SignInIdentifier.Email} target={email} />
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
        <VerificationCode type={UserFlow.register} method={SignInIdentifier.Phone} target={phone} />
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
          type={UserFlow.forgotPassword}
          method={SignInIdentifier.Email}
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

      // TODO: @simeng test exception flow to fulfill the password
    });

    it('fire phone forgot-password validate verification code event', async () => {
      (verifyForgotPasswordVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        success: true,
      }));

      const { container } = renderWithPageContext(
        <VerificationCode
          type={UserFlow.forgotPassword}
          method={SignInIdentifier.Phone}
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

      // TODO: @simeng test exception flow to fulfill the password
    });
  });

  describe('continue flow', () => {
    it('set email', async () => {
      (addProfileWithVerificationCodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: '/redirect',
      }));

      const { container } = renderWithPageContext(
        <VerificationCode type={UserFlow.continue} method={SignInIdentifier.Email} target={email} />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithVerificationCodeIdentifier).toBeCalledWith(
          {
            email,
            verificationCode: '111111',
          },
          undefined
        );
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
        <VerificationCode type={UserFlow.continue} method={SignInIdentifier.Phone} target={phone} />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithVerificationCodeIdentifier).toBeCalledWith(
          {
            phone,
            verificationCode: '111111',
          },
          undefined
        );
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('/redirect');
      });
    });
  });
});
