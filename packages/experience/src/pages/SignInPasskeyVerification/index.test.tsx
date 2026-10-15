import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { renderHook } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

import SignInPasskeyVerification from '.';

jest.mock('@/containers/CaptchaBox', () => () => <div data-testid="captcha-box" />);
jest.mock('@/utils/webauthn', () => ({ isWebAuthnOptions: () => true }));

describe('SignInPasskeyVerification', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set, remove } = result.current;

  const renderPasskeyVerificationPage = (password: boolean) =>
    renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signIn: {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password,
                verificationCode: true,
                isPasswordPrimary: password,
              },
            ],
          },
          passkeySignIn: {
            enabled: true,
            showPasskeyButton: false,
            allowAutofill: false,
          },
        }}
      >
        <UserInteractionContextProvider>
          <Routes>
            <Route path="/sign-in/passkey" element={<SignInPasskeyVerification />} />
          </Routes>
        </UserInteractionContextProvider>
      </SettingsProvider>,
      {
        initialEntries: [
          {
            pathname: '/sign-in/passkey',
            state: { options: { challenge: 'challenge' } },
          },
        ],
      }
    );

  beforeEach(() => {
    set(StorageKeys.IdentifierInputValue, {
      type: SignInIdentifier.Email,
      value: 'foo@logto.io',
    });
    set(StorageKeys.verificationIds, { [VerificationType.SignInPasskey]: 'verification-id' });
  });

  afterEach(() => {
    remove(StorageKeys.IdentifierInputValue);
    remove(StorageKeys.verificationIds);
  });

  it('mounts the CAPTCHA box for direct verification code fallback', () => {
    const { queryByTestId } = renderPasskeyVerificationPage(false);

    expect(queryByTestId('captcha-box')).not.toBeNull();
  });

  it('does not mount the CAPTCHA box when password fallback takes priority', () => {
    const { queryByTestId } = renderPasskeyVerificationPage(true);

    expect(queryByTestId('captcha-box')).toBeNull();
  });
});
