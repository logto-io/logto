import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { identifyForgotPasswordWithOneTimeToken } from '@/apis/experience';
import type { SignInExperienceResponse } from '@/types';

import ResetPasswordLanding from '.';

const mockedIdentifyForgotPasswordWithOneTimeToken =
  identifyForgotPasswordWithOneTimeToken as jest.MockedFunction<
    typeof identifyForgotPasswordWithOneTimeToken
  >;

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('@/apis/experience', () => ({
  identifyForgotPasswordWithOneTimeToken: jest.fn().mockResolvedValue({ verificationId: '123' }),
}));

describe('ResetPasswordLanding', () => {
  const renderPage = (
    initialEntry: string,
    forgotPassword?: SignInExperienceResponse['forgotPassword']
  ) =>
    renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          forgotPassword: {
            ...mockSignInExperienceSettings.forgotPassword,
            ...forgotPassword,
          },
        }}
      >
        <UserInteractionContextProvider>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordLanding />} />
            <Route path="/forgot-password/reset" element={<div>set password page</div>} />
            <Route path="/sign-in" element={<div>sign in page</div>} />
          </Routes>
        </UserInteractionContextProvider>
      </SettingsProvider>,
      { initialEntries: [initialEntry] }
    );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('auto verifies one-time token when login_hint is provided', async () => {
    const { queryByText } = renderPage(
      '/reset-password?one_time_token=token&login_hint=foo%40logto.io',
      { email: false, phone: false }
    );

    expect(queryByText('description.reset_password_magic_link_description')).not.toBeNull();

    await waitFor(() => {
      expect(mockedIdentifyForgotPasswordWithOneTimeToken).toBeCalledWith({
        token: 'token',
        identifier: { type: SignInIdentifier.Email, value: 'foo@logto.io' },
      });
      expect(queryByText('set password page')).not.toBeNull();
    });
  });

  it('asks for email before verifying one-time token when login_hint is missing', async () => {
    const { container, getByText, queryByText } = renderPage(
      '/reset-password?one_time_token=token',
      { email: false, phone: false }
    );

    expect(queryByText('description.reset_password_magic_link_description')).not.toBeNull();
    expect(mockedIdentifyForgotPasswordWithOneTimeToken).not.toBeCalled();

    const identifierInput = container.querySelector('input[name="identifier"]');
    assert(identifierInput, new Error('identifier input should not be null'));

    fireEvent.change(identifierInput, { target: { value: 'foo@logto.io' } });
    fireEvent.click(getByText('action.continue'));

    await waitFor(() => {
      expect(mockedIdentifyForgotPasswordWithOneTimeToken).toBeCalledWith({
        token: 'token',
        identifier: { type: SignInIdentifier.Email, value: 'foo@logto.io' },
      });
      expect(queryByText('set password page')).not.toBeNull();
    });
  });

  it('keeps existing self-service reset fallback when one-time token is missing', () => {
    const { queryByText } = renderPage('/reset-password', { email: false, phone: false });

    expect(queryByText('sign in page')).not.toBeNull();
    expect(queryByText('description.reset_password_magic_link_description')).toBeNull();
  });
});
