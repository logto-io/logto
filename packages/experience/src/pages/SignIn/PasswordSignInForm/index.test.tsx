import { SignInIdentifier, experience } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, mockSsoConnectors } from '@/__mocks__/logto';
import { signInWithPasswordIdentifier } from '@/apis/experience';
import type { SignInExperienceResponse } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import PasswordSignInForm from '.';

jest.mock('react-device-detect', () => ({
  isMobile: true,
}));

const mockedNavigate = jest.fn();
const getSingleSignOnConnectorsMock = jest.fn();
const getSingleSignOnUrlMock = jest.fn();

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('@/apis/experience', () => ({
  signInWithPasswordIdentifier: jest.fn(async () => 0),
  getSsoAuthorizationUrl: (connectorId: string) => getSingleSignOnUrlMock(connectorId),
  getSsoConnectors: (email: string) => getSingleSignOnConnectorsMock(email),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
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
        <UserInteractionContextProvider>
          <SingleSignOnFormModeContextProvider>
            <PasswordSignInForm signInMethods={signInMethods} />
          </SingleSignOnFormModeContextProvider>
        </UserInteractionContextProvider>
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
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('error.general_required')).not.toBeNull();
      expect(queryByText('error.password_required')).not.toBeNull();
    });

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');

    assert(identifierInput, new Error('identifier input should exist'));
    assert(passwordInput, new Error('password input should exist'));

    act(() => {
      fireEvent.change(identifierInput, { target: { value: 'username' } });
      fireEvent.blur(identifierInput);
    });

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.blur(passwordInput);
    });

    await waitFor(() => {
      expect(queryByText('error.general_required')).toBeNull();
      expect(queryByText('error.password_required')).toBeNull();
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
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('error.general_invalid')).not.toBeNull();
    });

    act(() => {
      fireEvent.change(identifierInput, { target: { value: validInput } });
      fireEvent.blur(identifierInput);
    });

    await waitFor(() => {
      expect(queryByText('error.general_invalid')).toBeNull();
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

    act(() => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(signInWithPasswordIdentifier).toBeCalledWith({
        identifier: {
          type,
          value:
            type === SignInIdentifier.Phone
              ? `${getDefaultCountryCallingCode()}${identifier}`
              : identifier,
        },
        password: 'password',
      });
    });
  });

  test('should switch to single sign on form when single sign on is enabled for a give email', async () => {
    const { getByText, queryByText, container } = renderPasswordSignInForm(
      [SignInIdentifier.Username, SignInIdentifier.Email],
      {
        ssoConnectors: mockSsoConnectors,
      }
    );

    const passwordFormAssertion = () => {
      expect(container.querySelector('input[name="password"]')).not.toBeNull();
      expect(queryByText('action.sign_in')).not.toBeNull();
    };

    const singleSignOnFormAssertion = () => {
      expect(container.querySelector('input[name="password"]')).toBeNull();
      expect(queryByText('action.sign_in')).toBeNull();
      expect(queryByText('action.single_sign_on')).not.toBeNull();
    };

    const identifierInput = container.querySelector('input[name="identifier"]');
    assert(identifierInput, new Error('identifier input should exist'));

    // Default
    passwordFormAssertion();

    // Username
    act(() => {
      fireEvent.change(identifierInput, { target: { value: 'foo' } });
    });
    passwordFormAssertion();

    // Invalid email
    act(() => {
      fireEvent.change(identifierInput, { target: { value: 'foo@l' } });
    });
    passwordFormAssertion();
    expect(getSingleSignOnConnectorsMock).not.toBeCalled();

    // Valid email with empty response
    const email = 'foo@logto.io';
    getSingleSignOnConnectorsMock.mockResolvedValueOnce({ connectorIds: [] });
    act(() => {
      fireEvent.change(identifierInput, { target: { value: email } });
    });

    await waitFor(() => {
      expect(getSingleSignOnConnectorsMock).toBeCalledWith(email);
    });

    passwordFormAssertion();

    // Valid email with response
    const email2 = 'foo@bar.io';
    getSingleSignOnConnectorsMock.mockClear();
    getSingleSignOnConnectorsMock.mockResolvedValueOnce({
      connectorIds: mockSsoConnectors.map(({ id }) => id),
    });

    act(() => {
      fireEvent.change(identifierInput, { target: { value: email2 } });
    });

    await waitFor(() => {
      expect(getSingleSignOnConnectorsMock).toBeCalledWith(email2);
    });

    await waitFor(() => {
      singleSignOnFormAssertion();
    });

    const submitButton = getByText('action.single_sign_on');

    act(() => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(mockedNavigate).toBeCalledWith(`/${experience.routes.sso}/connectors`);
    });
  });

  test('should directly call single sign on when single sign on is enabled for a give email and only one connector', async () => {
    const { getByText, queryByText, container } = renderPasswordSignInForm(
      [SignInIdentifier.Username, SignInIdentifier.Email],
      {
        ssoConnectors: mockSsoConnectors,
      }
    );

    const singleSignOnFormAssertion = () => {
      expect(container.querySelector('input[name="password"]')).toBeNull();
      expect(queryByText('action.sign_in')).toBeNull();
      expect(queryByText('action.single_sign_on')).not.toBeNull();
    };

    const identifierInput = container.querySelector('input[name="identifier"]');
    assert(identifierInput, new Error('identifier input should exist'));

    const email = 'foo@bar.io';
    getSingleSignOnConnectorsMock.mockClear();
    getSingleSignOnConnectorsMock.mockResolvedValueOnce({
      connectorIds: [mockSsoConnectors[0]!.id],
    });

    act(() => {
      fireEvent.change(identifierInput, { target: { value: email } });
    });

    await waitFor(() => {
      expect(getSingleSignOnConnectorsMock).toBeCalledWith(email);
    });

    await waitFor(() => {
      singleSignOnFormAssertion();
    });

    const submitButton = getByText('action.single_sign_on');

    act(() => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(getSingleSignOnUrlMock).toBeCalledWith(mockSsoConnectors[0]!.id);
    });
  });
});
