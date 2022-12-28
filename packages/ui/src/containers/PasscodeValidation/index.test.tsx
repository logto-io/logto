import { SignInIdentifier } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import {
  verifyForgotPasswordPasscodeIdentifier,
  signInWithPasscodeIdentifier,
  addProfileWithPasscodeIdentifier,
} from '@/apis/interaction';
import { UserFlow } from '@/types';

import PasscodeValidation from '.';

jest.useFakeTimers();

const sendPasscodeApi = jest.fn();

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/utils', () => ({
  getSendPasscodeApi: () => sendPasscodeApi,
}));

jest.mock('@/apis/interaction', () => ({
  verifyForgotPasswordPasscodeIdentifier: jest.fn(),
  signInWithPasscodeIdentifier: jest.fn(),
  addProfileWithPasscodeIdentifier: jest.fn(),
}));

describe('<PasscodeValidation />', () => {
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
      <PasscodeValidation type={UserFlow.signIn} method={SignInIdentifier.Email} target={email} />
    );

    expect(queryByText('description.resend_after_seconds')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });

    expect(queryByText('description.resend_passcode')).not.toBeNull();
  });

  it('fire resend event', async () => {
    const { getByText } = renderWithPageContext(
      <PasscodeValidation type={UserFlow.signIn} method={SignInIdentifier.Email} target={email} />
    );
    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });
    const resendButton = getByText('description.resend_passcode');

    await waitFor(() => {
      fireEvent.click(resendButton);
    });

    expect(sendPasscodeApi).toBeCalledWith({ email });
  });

  describe('sign-in', () => {
    it('fire email sign-in validate passcode event', async () => {
      (signInWithPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation type={UserFlow.signIn} method={SignInIdentifier.Email} target={email} />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(signInWithPasscodeIdentifier).toBeCalledWith(
          { email, passcode: '111111' },
          undefined
        );
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });

    it('fire sms sign-in validate passcode event', async () => {
      (signInWithPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation type={UserFlow.signIn} method={SignInIdentifier.Sms} target={phone} />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(signInWithPasscodeIdentifier).toBeCalledWith(
          {
            phone,
            passcode: '111111',
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
    it('fire email register validate passcode event', async () => {
      (addProfileWithPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation
          type={UserFlow.register}
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
        expect(addProfileWithPasscodeIdentifier).toBeCalledWith({
          email,
          passcode: '111111',
        });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });

    it('fire sms register validate passcode event', async () => {
      (addProfileWithPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: 'foo.com',
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation type={UserFlow.register} method={SignInIdentifier.Sms} target={phone} />
      );
      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithPasscodeIdentifier).toBeCalledWith({ phone, passcode: '111111' });
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });
  });

  describe('forgot password', () => {
    it('fire email forgot-password validate passcode event', async () => {
      (verifyForgotPasswordPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        success: true,
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation
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
        expect(verifyForgotPasswordPasscodeIdentifier).toBeCalledWith({
          email,
          passcode: '111111',
        });
      });

      // TODO: @simeng test exception flow to fulfill the password
    });

    it('fire sms forgot-password validate passcode event', async () => {
      (verifyForgotPasswordPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        success: true,
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation
          type={UserFlow.forgotPassword}
          method={SignInIdentifier.Sms}
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
        expect(verifyForgotPasswordPasscodeIdentifier).toBeCalledWith({
          phone,
          passcode: '111111',
        });
      });

      // TODO: @simeng test exception flow to fulfill the password
    });
  });

  describe('continue flow', () => {
    it('set email', async () => {
      (addProfileWithPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: '/redirect',
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation
          type={UserFlow.continue}
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
        expect(addProfileWithPasscodeIdentifier).toBeCalledWith(
          {
            email,
            passcode: '111111',
          },
          undefined
        );
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('/redirect');
      });
    });

    it('set Phone', async () => {
      (addProfileWithPasscodeIdentifier as jest.Mock).mockImplementationOnce(() => ({
        redirectTo: '/redirect',
      }));

      const { container } = renderWithPageContext(
        <PasscodeValidation type={UserFlow.continue} method={SignInIdentifier.Sms} target={phone} />
      );

      const inputs = container.querySelectorAll('input');

      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      await waitFor(() => {
        expect(addProfileWithPasscodeIdentifier).toBeCalledWith(
          {
            phone,
            passcode: '111111',
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
