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

  it('mounts the CAPTCHA box when verification code sign-in is available', () => {
    const { queryByTestId } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signIn: {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: false,
                verificationCode: true,
                isPasswordPrimary: false,
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

    expect(queryByTestId('captcha-box')).not.toBeNull();
  });
});
