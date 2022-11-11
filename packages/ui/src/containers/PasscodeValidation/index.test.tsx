import { SignInIdentifier } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import {
  verifyContinueSetEmailPasscode,
  continueApi,
  verifyContinueSetSmsPasscode,
} from '@/apis/continue';
import {
  verifyForgotPasswordEmailPasscode,
  verifyForgotPasswordSmsPasscode,
} from '@/apis/forgot-password';
import { verifyRegisterEmailPasscode, verifyRegisterSmsPasscode } from '@/apis/register';
import { verifySignInEmailPasscode, verifySignInSmsPasscode } from '@/apis/sign-in';
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

jest.mock('@/apis/sign-in', () => ({
  verifySignInEmailPasscode: jest.fn(),
  verifySignInSmsPasscode: jest.fn(),
}));

jest.mock('@/apis/register', () => ({
  verifyRegisterEmailPasscode: jest.fn(),
  verifyRegisterSmsPasscode: jest.fn(),
}));

jest.mock('@/apis/forgot-password', () => ({
  verifyForgotPasswordEmailPasscode: jest.fn(),
  verifyForgotPasswordSmsPasscode: jest.fn(),
}));

jest.mock('@/apis/continue', () => ({
  verifyContinueSetEmailPasscode: jest.fn(),
  verifyContinueSetSmsPasscode: jest.fn(),
  continueApi: jest.fn(),
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

    expect(sendPasscodeApi).toBeCalledWith(email);
  });

  describe('sign-in', () => {
    it('fire email sign-in validate passcode event', async () => {
      (verifySignInEmailPasscode as jest.Mock).mockImplementationOnce(() => ({
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
        expect(verifySignInEmailPasscode).toBeCalledWith(email, '111111', undefined);
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });

    it('fire sms sign-in validate passcode event', async () => {
      (verifySignInSmsPasscode as jest.Mock).mockImplementationOnce(() => ({
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
        expect(verifySignInSmsPasscode).toBeCalledWith(phone, '111111', undefined);
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });
  });

  describe('register', () => {
    it('fire email register validate passcode event', async () => {
      (verifyRegisterEmailPasscode as jest.Mock).mockImplementationOnce(() => ({
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
        expect(verifyRegisterEmailPasscode).toBeCalledWith(email, '111111');
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });

    it('fire sms register validate passcode event', async () => {
      (verifyRegisterSmsPasscode as jest.Mock).mockImplementationOnce(() => ({
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
        expect(verifyRegisterSmsPasscode).toBeCalledWith(phone, '111111');
      });

      await waitFor(() => {
        expect(window.location.replace).toBeCalledWith('foo.com');
      });
    });
  });

  describe('forgot password', () => {
    it('fire email forgot-password validate passcode event', async () => {
      (verifyForgotPasswordEmailPasscode as jest.Mock).mockImplementationOnce(() => ({
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
        expect(verifyForgotPasswordEmailPasscode).toBeCalledWith(email, '111111');
      });

      await waitFor(() => {
        expect(window.location.replace).not.toBeCalled();
        expect(mockedNavigate).toBeCalledWith('/forgot-password/reset', { replace: true });
      });
    });

    it('fire sms forgot-password validate passcode event', async () => {
      (verifyForgotPasswordSmsPasscode as jest.Mock).mockImplementationOnce(() => ({
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
        expect(verifyForgotPasswordSmsPasscode).toBeCalledWith(phone, '111111');
      });

      await waitFor(() => {
        expect(window.location.replace).not.toBeCalled();
        expect(mockedNavigate).toBeCalledWith('/forgot-password/reset', { replace: true });
      });
    });
  });

  describe('continue flow', () => {
    it('set email', async () => {
      (verifyContinueSetEmailPasscode as jest.Mock).mockImplementationOnce(() => ({
        success: true,
      }));
      (continueApi as jest.Mock).mockImplementationOnce(() => ({ redirectTo: '/redirect' }));

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
        expect(verifyContinueSetEmailPasscode).toBeCalledWith(email, '111111');
      });

      await waitFor(() => {
        expect(continueApi).toBeCalledWith('email', email, undefined);
        expect(window.location.replace).toBeCalledWith('/redirect');
      });
    });

    it('set Phone', async () => {
      (verifyContinueSetSmsPasscode as jest.Mock).mockImplementationOnce(() => ({
        success: true,
      }));
      (continueApi as jest.Mock).mockImplementationOnce(() => ({ redirectTo: '/redirect' }));

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
        expect(verifyContinueSetSmsPasscode).toBeCalledWith(phone, '111111');
      });

      await waitFor(() => {
        expect(continueApi).toBeCalledWith('phone', phone, undefined);
        expect(window.location.replace).toBeCalledWith('/redirect');
      });
    });
  });
});
