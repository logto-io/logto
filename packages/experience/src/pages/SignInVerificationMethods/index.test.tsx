import { SignInIdentifier } from '@logto/schemas';
import { renderHook } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

import SignInVerificationMethods from '.';

jest.mock('@/containers/CaptchaBox', () => () => <div data-testid="captcha-box" />);

describe('SignInVerificationMethods', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set, remove } = result.current;

  beforeEach(() => {
    set(StorageKeys.IdentifierInputValue, {
      type: SignInIdentifier.Email,
      value: 'foo@logto.io',
    });
  });

  afterEach(() => {
    remove(StorageKeys.IdentifierInputValue);
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
                password: true,
                verificationCode: true,
                isPasswordPrimary: true,
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
            <Route path="/sign-in/verification-methods" element={<SignInVerificationMethods />} />
          </Routes>
        </UserInteractionContextProvider>
      </SettingsProvider>,
      { initialEntries: ['/sign-in/verification-methods'] }
    );

    const captchaBox = queryByTestId('captcha-box');

    expect(captchaBox).not.toBeNull();
    expect(captchaBox?.closest('[class*="methodList"]')).toBeNull();
  });
});
