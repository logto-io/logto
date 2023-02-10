import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { signInWithPasswordIdentifier } from '@/apis/interaction';
import ConfirmModalProvider from '@/containers/ConfirmModalProvider';
import type { SignInExperienceResponse } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import PasswordSignInForm from '.';

jest.mock('@/apis/interaction', () => ({ signInWithPasswordIdentifier: jest.fn(async () => 0) }));
jest.mock('react-device-detect', () => ({
  isMobile: true,
}));

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
}));

describe('UsernamePasswordSignInForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderPasswordSignInForm = (
    signInMethods = [SignInIdentifier.Username, SignInIdentifier.Email, SignInIdentifier.Phone],
    settings?: Partial<SignInExperienceResponse>
  ) =>
    renderWithPageContext(
      <SettingsProvider settings={{ ...mockSignInExperienceSettings, ...settings }}>
        <MemoryRouter>
          <ConfirmModalProvider>
            <PasswordSignInForm signInMethods={signInMethods} />
          </ConfirmModalProvider>
        </MemoryRouter>
      </SettingsProvider>
    );

  test.each([
    [SignInIdentifier.Username],
    [SignInIdentifier.Email],
    [SignInIdentifier.Phone],
    [SignInIdentifier.Username, SignInIdentifier.Email],
    [SignInIdentifier.Username, SignInIdentifier.Phone],
    [SignInIdentifier.Email, SignInIdentifier.Phone],
    [SignInIdentifier.Username, SignInIdentifier.Email, SignInIdentifier.Phone],
  ])('render %p', (...methods) => {
    const { queryByText, container } = renderPasswordSignInForm(methods);
    expect(container.querySelector('input[name="identifier"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
    expect(queryByText('description.agree_with_terms')).not.toBeNull();
    expect(queryByText('action.forgot_password')).not.toBeNull();
  });

  test('render with forgot password disabled', () => {
    const { queryByText } = renderPasswordSignInForm([SignInIdentifier.Username], {
      forgotPassword: { phone: false, email: false },
    });

    expect(queryByText('action.forgot_password')).toBeNull();
  });

  test('required inputs with error message', async () => {
    const { queryByText, getByText, container } = renderPasswordSignInForm();
    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('general_required')).not.toBeNull();
      expect(queryByText('password_required')).not.toBeNull();
    });

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');

    assert(identifierInput, new Error('identifier input should exist'));
    assert(passwordInput, new Error('password input should exist'));

    act(() => {
      fireEvent.change(identifierInput, { target: { value: 'username' } });
    });

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    });

    await waitFor(() => {
      expect(queryByText('general_required')).toBeNull();
      expect(queryByText('password_required')).toBeNull();
    });
  });

  test.each([
    ['0username', 'username'],
    ['foo@logto', 'foo@logto.io'],
    ['8573', '8573333333'],
  ])('Invalid input $p should throw error message', async (invalidInput, validInput) => {
    const { queryByText, getByText, container } = renderPasswordSignInForm();
    const submitButton = getByText('action.sign_in');

    const identifierInput = container.querySelector('input[name="identifier"]');

    assert(identifierInput, new Error('identifier input should exist'));

    act(() => {
      fireEvent.change(identifierInput, { target: { value: invalidInput } });
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('general_invalid')).not.toBeNull();
    });

    act(() => {
      fireEvent.change(identifierInput, { target: { value: validInput } });
    });

    await waitFor(() => {
      expect(queryByText('general_invalid')).toBeNull();
    });
  });

  test('should show terms confirm modal', async () => {
    const { queryByText, getByText, container } = renderPasswordSignInForm();
    const submitButton = getByText('action.sign_in');

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');

    assert(identifierInput, new Error('identifier input should exist'));
    assert(passwordInput, new Error('password input should exist'));

    act(() => {
      fireEvent.change(identifierInput, { target: { value: 'username' } });
    });

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('description.agree_with_terms_modal')).not.toBeNull();
    });
  });

  test.each([
    ['username', SignInIdentifier.Username],
    ['foo@logto.io', SignInIdentifier.Email],
    ['8573333333', SignInIdentifier.Phone],
  ])('submit form', async (identifier: string, type: SignInIdentifier) => {
    const { getByText, container } = renderPasswordSignInForm();

    const submitButton = getByText('action.sign_in');

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');

    assert(identifierInput, new Error('identifier input should exist'));
    assert(passwordInput, new Error('password input should exist'));

    fireEvent.change(identifierInput, { target: { value: identifier } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    const termsButton = getByText('description.agree_with_terms');

    act(() => {
      fireEvent.click(termsButton);
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    act(() => {
      void waitFor(() => {
        expect(signInWithPasswordIdentifier).toBeCalledWith({
          [type]:
            type === SignInIdentifier.Phone
              ? `${getDefaultCountryCallingCode()}${identifier}`
              : identifier,
          password: 'password',
        });
      });
    });
  });
});
