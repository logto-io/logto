import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { signInBasic } from '@/apis/sign-in';
import { termsOfUseConfirmModalPromise } from '@/containers/TermsOfUse/TermsOfUseConfirmModal';
import { termsOfUseIframeModalPromise } from '@/containers/TermsOfUse/TermsOfUseIframeModal';
import { ConfirmModalMessage } from '@/types';

import UsernameSignIn from '.';

jest.mock('@/apis/sign-in', () => ({ signInBasic: jest.fn(async () => 0) }));
jest.mock('@/containers/TermsOfUse/TermsOfUseConfirmModal', () => ({
  termsOfUseConfirmModalPromise: jest.fn().mockResolvedValue(true),
}));
jest.mock('@/containers/TermsOfUse/TermsOfUseIframeModal', () => ({
  termsOfUseIframeModalPromise: jest.fn().mockResolvedValue(true),
}));

const termsOfUseConfirmModalPromiseMock = termsOfUseConfirmModalPromise as jest.Mock;
const termsOfUseIframeModalPromiseMock = termsOfUseIframeModalPromise as jest.Mock;

describe('<UsernameSignIn>', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(<UsernameSignIn />);
    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <UsernameSignIn />
      </SettingsProvider>
    );
    expect(queryByText('description.agree_with_terms')).not.toBeNull();
  });

  test('required inputs with error message', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<UsernameSignIn />);
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
        <UsernameSignIn />
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

    await act(async () => {
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(termsOfUseConfirmModalPromiseMock).toBeCalled();
      });
    });
  });

  test('should show terms detail modal', async () => {
    termsOfUseConfirmModalPromiseMock.mockRejectedValue(
      ConfirmModalMessage.SHOW_TERMS_DETAIL_MODAL
    );

    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameSignIn />
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

    act(() => {
      fireEvent.click(submitButton);
    });

    expect(signInBasic).not.toBeCalled();

    await waitFor(() => {
      expect(termsOfUseIframeModalPromiseMock).toBeCalled();
    });
  });

  test('submit form', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameSignIn />
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

    act(() => {
      fireEvent.click(termsButton);
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    act(() => {
      void waitFor(() => {
        expect(signInBasic).toBeCalledWith('username', 'password', undefined);
      });
    });
  });
});
