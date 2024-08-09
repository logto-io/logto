import { SignInIdentifier } from '@logto/schemas';
import { renderHook } from '@testing-library/react';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

import SignInPassword from '.';

describe('SignInPassword', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set, remove } = result.current;
  const email = 'email@logto.io';
  const phone = '18571111111';
  const username = 'foo';

  const renderPasswordSignInPage = (settings?: Partial<typeof mockSignInExperienceSettings>) =>
    renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          ...settings,
        }}
      >
        <UserInteractionContextProvider>
          <SignInPassword />
        </UserInteractionContextProvider>
      </SettingsProvider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Show invalid session error page with invalid state', () => {
    const { queryByText } = renderPasswordSignInPage();
    expect(queryByText('description.enter_password')).toBeNull();
    expect(queryByText('error.invalid_session')).not.toBeNull();
  });

  test('Show 404 error page with invalid method', () => {
    set(StorageKeys.IdentifierInputValue, { type: SignInIdentifier.Username, value: username });

    const { queryByText } = renderPasswordSignInPage({
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
    });

    expect(queryByText('description.enter_password')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();

    remove(StorageKeys.IdentifierInputValue);
  });

  test.each([
    { identifier: SignInIdentifier.Email, value: email, verificationCode: true },
    { identifier: SignInIdentifier.Phone, value: phone, verificationCode: false },
  ])(
    'render password page with %variable.identifier',
    ({ identifier, value, verificationCode }) => {
      set(StorageKeys.IdentifierInputValue, { type: identifier, value });

      const { queryByText, container } = renderPasswordSignInPage({
        signIn: {
          methods: [
            {
              identifier,
              password: true,
              verificationCode,
              isPasswordPrimary: true,
            },
          ],
        },
      });

      expect(queryByText('description.enter_password')).not.toBeNull();
      expect(container.querySelector('input[name="password"]')).not.toBeNull();

      if (verificationCode) {
        expect(queryByText('action.sign_in_via_passcode')).not.toBeNull();
      } else {
        expect(queryByText('action.sign_in_via_passcode')).toBeNull();
      }

      remove(StorageKeys.IdentifierInputValue);
    }
  );
});
