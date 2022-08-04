import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { signInBasic } from '@/apis/sign-in';
import { termsOfUseConfirmModalPromise } from '@/containers/TermsOfUse/TermsOfUseConfirmModal';
import { termsOfUseIframeModalPromise } from '@/containers/TermsOfUse/TermsOfUseIframeModal';
import { TermsOfUseModalMessage } from '@/types';

import UsernameSignin from '.';

jest.mock('@/apis/sign-in', () => ({ signInBasic: jest.fn(async () => 0) }));
jest.mock('@/containers/TermsOfUse/TermsOfUseConfirmModal', () => ({
  termsOfUseConfirmModalPromise: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/containers/TermsOfUse/TermsOfUseIframeModal', () => ({
  termsOfUseIframeModalPromise: jest.fn().mockResolvedValue(true),
}));

const termsOfUseConfirmModalPromiseMock = termsOfUseConfirmModalPromise as jest.Mock;
const termsOfUseIframeModalPromiseMock = termsOfUseIframeModalPromise as jest.Mock;

describe('<UsernameSignin>', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(<UsernameSignin />);
    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <UsernameSignin />
      </SettingsProvider>
    );
    expect(queryByText('description.agree_with_terms')).not.toBeNull();
  });

  test('required inputs with error message', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<UsernameSignin />);
    const submitButton = getByText('action.sign_in');

    fireEvent.click(submitButton);

    expect(queryByText('username_required')).not.toBeNull();
    expect(queryByText('password_required')).not.toBeNull();

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    expect(usernameInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    expect(queryByText('required')).toBeNull();
  });

  test('should show terms confirm modal', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameSignin />
      </SettingsProvider>
    );
    const submitButton = getByText('action.sign_in');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(signInBasic).toBeCalledWith('username', 'password', undefined);
  });

  test('should show terms detail modal', async () => {
    termsOfUseConfirmModalPromiseMock.mockRejectedValue(TermsOfUseModalMessage.SHOW_DETAIL_MODAL);

    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameSignin />
      </SettingsProvider>
    );
    const submitButton = getByText('action.sign_in');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(termsOfUseIframeModalPromiseMock).toBeCalledWith();
  });

  test('submit form', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameSignin />
      </SettingsProvider>
    );
    const submitButton = getByText('action.sign_in');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(signInBasic).toBeCalledWith('username', 'password', undefined);
  });
});
