import { act, fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';

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

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('render counter', () => {
    const { queryByText, debug } = renderWithPageContext(
      <PasscodeValidation type="sign-in" method="email" target={email} />
    );

    expect(queryByText('description.resend_after_seconds')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1e3 * 60);
    });

    expect(queryByText('description.resend_passcode')).not.toBeNull();
  });

  it('fire resend event', async () => {
    const { getByText } = renderWithPageContext(
      <PasscodeValidation type="sign-in" method="email" target={email} />
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
      <PasscodeValidation type="sign-in" method="email" target={email} />
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
});
