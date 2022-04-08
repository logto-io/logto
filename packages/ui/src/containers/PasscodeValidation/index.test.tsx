import { render, act, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import PasscodeValidation from '.';

jest.useFakeTimers();

const sendPasscodeApi = jest.fn();
const verifyPasscodeApi = jest.fn();

jest.mock('@/apis/utils', () => ({
  getSendPasscodeApi: () => sendPasscodeApi,
  getVerifyPasscodeApi: () => verifyPasscodeApi,
}));

jest.mock('@/hooks/page-context', () =>
  React.createContext({
    loading: false,
    setLoading: jest.fn(),
  })
);

describe('<PasscodeValidation />', () => {
  const email = 'foo@logto.io';

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('render counter', () => {
    const { queryByText } = render(
      <PasscodeValidation type="sign-in" channel="email" target={email} />
    );

    expect(queryByText('description.resend_after_senconds')).not.toBeNull();

    act(() => {
      jest.runAllTimers();
    });

    expect(queryByText('description.resend_passcode')).not.toBeNull();
  });

  it('fire resend event', async () => {
    const { getByText } = render(
      <PasscodeValidation type="sign-in" channel="email" target={email} />
    );
    act(() => {
      jest.runAllTimers();
    });
    const resendButton = getByText('description.resend_passcode');

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
