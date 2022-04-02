import { render, act, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import PasscodeValidation, { timeRange } from '.';

jest.useFakeTimers();

const sendPasscodeApi = jest.fn();
const verifyPasscodeApi = jest.fn();

jest.mock('@/apis/utils', () => ({
  getSendPasscodeApi: () => sendPasscodeApi,
  getVerifyPasscodeApi: () => verifyPasscodeApi,
}));

describe('<PasscodeValidation />', () => {
  const email = 'foo@logto.io';

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('render counter', () => {
    const { queryByText } = render(
      <PasscodeValidation type="sign-in" channel="email" target={email} />
    );

    expect(queryByText(timeRange)).not.toBeNull();

    act(() => {
      jest.runAllTimers();
    });

    expect(queryByText('sign_in.resend_passcode')).not.toBeNull();
  });

  it('fire resend event', async () => {
    const { getByText } = render(
      <PasscodeValidation type="sign-in" channel="email" target={email} />
    );
    act(() => {
      jest.runAllTimers();
    });
    const resendButton = getByText('sign_in.resend_passcode');

    await waitFor(() => {
      fireEvent.click(resendButton);
    });

    expect(sendPasscodeApi).toBeCalledWith(email);
  });

  it('fire validate passcode event', async () => {
    const { container } = render(
      <PasscodeValidation type="sign-in" channel="email" target={email} />
    );
    const inputs = container.querySelectorAll('input');

    await waitFor(() => {
      for (const input of inputs) {
        act(() => {
          fireEvent.input(input, { target: { value: '1' } });
        });
      }

      expect(verifyPasscodeApi).toBeCalledWith(email, '111111');
    });
  });
});
