import { act, fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { UserFlow } from '@/types';

import PasscodeValidation from '.';

jest.useFakeTimers();

const sendPasscodeApi = jest.fn();
const verifyPasscodeApi = jest.fn();

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/utils', () => ({
  getSendPasscodeApi: () => sendPasscodeApi,
  getVerifyPasscodeApi: () => verifyPasscodeApi,
}));

describe('<PasscodeValidation />', () => {
  const email = 'foo@logto.io';
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
      <PasscodeValidation type={UserFlow.signIn} method="email" target={email} />
    );

    expect(queryByText('description.resend_after_seconds')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });

    expect(queryByText('description.resend_passcode')).not.toBeNull();
  });

  it('fire resend event', async () => {
    const { getByText } = renderWithPageContext(
      <PasscodeValidation type={UserFlow.signIn} method="email" target={email} />
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

  it('fire validate passcode event', async () => {
    const { container } = renderWithPageContext(
      <PasscodeValidation type={UserFlow.signIn} method="email" target={email} />
    );
    const inputs = container.querySelectorAll('input');

    await waitFor(() => {
      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      expect(verifyPasscodeApi).toBeCalledWith(email, '111111', undefined);
    });
  });

  it('should redirect with success redirectUri response', async () => {
    verifyPasscodeApi.mockImplementationOnce(() => ({ redirectTo: 'foo.com' }));

    const { container } = renderWithPageContext(
      <PasscodeValidation type={UserFlow.signIn} method="email" target={email} />
    );

    const inputs = container.querySelectorAll('input');

    await waitFor(() => {
      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      expect(verifyPasscodeApi).toBeCalledWith(email, '111111', undefined);
    });

    await waitFor(() => {
      expect(window.location.replace).toBeCalledWith('foo.com');
    });
  });

  it('should redirect to reset password page if the flow is forgot-password', async () => {
    verifyPasscodeApi.mockImplementationOnce(() => ({ success: true }));

    const { container } = renderWithPageContext(
      <PasscodeValidation type={UserFlow.forgotPassword} method="email" target={email} />
    );

    const inputs = container.querySelectorAll('input');

    await waitFor(() => {
      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      expect(verifyPasscodeApi).toBeCalledWith(email, '111111', undefined);
    });

    await waitFor(() => {
      expect(window.location.replace).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith('/forgot-password/reset', { replace: true });
    });
  });
});
