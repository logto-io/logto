import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { signInWithPasswordIdentifier, putInteraction, sendPasscode } from '@/apis/interaction';
import { UserFlow } from '@/types';

import PasswordSignInForm from '.';

jest.mock('@/apis/interaction', () => ({
  signInWithPasswordIdentifier: jest.fn(() => ({ redirectTo: '/' })),
  sendPasscode: jest.fn(() => ({ success: true })),
  putInteraction: jest.fn(() => ({ success: true })),
}));

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('PasswordSignInForm', () => {
  const email = 'foo@logto.io';
  const phone = '18573333333';
  const password = '111222';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Password is required', async () => {
    const { getByText, queryByText } = renderWithPageContext(
      <PasswordSignInForm method={SignInIdentifier.Email} value={email} />
    );

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(signInWithPasswordIdentifier).not.toBeCalled();
      expect(queryByText('password_required')).not.toBeNull();
    });
  });

  it('EmailPasswordSignForm', async () => {
    const { getByText, container } = renderWithPageContext(
      <PasswordSignInForm hasPasswordlessButton method={SignInIdentifier.Email} value={email} />
    );

    const passwordInput = container.querySelector('input[name="password"]');

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: password } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(signInWithPasswordIdentifier).toBeCalledWith({ email, password }, undefined);
    });

    const sendPasscodeLink = getByText('action.sign_in_via_passcode');

    expect(sendPasscodeLink).not.toBeNull();

    act(() => {
      fireEvent.click(sendPasscodeLink);
    });

    await waitFor(() => {
      expect(putInteraction).toBeCalledWith(InteractionEvent.SignIn);
      expect(sendPasscode).toBeCalledWith({ email });
    });

    expect(mockedNavigate).toBeCalledWith(
      {
        pathname: `/${UserFlow.signIn}/${SignInIdentifier.Email}/passcode-validation`,
        search: '',
      },
      {
        state: { email },
        replace: true,
      }
    );
  });

  it('PhonePasswordSignForm', async () => {
    const { getByText, container } = renderWithPageContext(
      <PasswordSignInForm hasPasswordlessButton method={SignInIdentifier.Phone} value={phone} />
    );

    const passwordInput = container.querySelector('input[name="password"]');

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: password } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(signInWithPasswordIdentifier).toBeCalledWith({ phone, password }, undefined);
    });

    const sendPasscodeLink = getByText('action.sign_in_via_passcode');

    expect(sendPasscodeLink).not.toBeNull();

    act(() => {
      fireEvent.click(sendPasscodeLink);
    });

    await waitFor(() => {
      expect(putInteraction).toBeCalledWith(InteractionEvent.SignIn);
      expect(sendPasscode).toBeCalledWith({ phone });
    });

    expect(mockedNavigate).toBeCalledWith(
      {
        pathname: `/${UserFlow.signIn}/${SignInIdentifier.Phone}/passcode-validation`,
        search: '',
      },
      {
        state: { phone },
        replace: true,
      }
    );
  });
});
