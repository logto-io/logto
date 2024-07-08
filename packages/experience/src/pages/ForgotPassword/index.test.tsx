import { SignInIdentifier } from '@logto/schemas';
import { Globals } from '@react-spring/web';
import { assert } from '@silverhand/essentials';
import { renderHook } from '@testing-library/react';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, getBoundingClientRectMock } from '@/__mocks__/logto';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import type { SignInExperienceResponse } from '@/types';

import ForgotPassword from '.';

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({})),
}));

describe('ForgotPassword', () => {
  const renderPage = (settings?: SignInExperienceResponse['forgotPassword']) =>
    renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          forgotPassword: {
            ...mockSignInExperienceSettings.forgotPassword,
            ...settings,
          },
        }}
      >
        <UserInteractionContextProvider>
          <ForgotPassword />
        </UserInteractionContextProvider>
      </SettingsProvider>
    );

  beforeAll(() => {
    Globals.assign({
      skipAnimation: true,
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.HTMLDivElement.prototype.getBoundingClientRect = getBoundingClientRectMock({
      width: 100,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render error page if forgot password is not enabled', () => {
    const { queryByText } = renderPage({ email: false, phone: false });
    expect(queryByText('description.reset_password')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  describe.each([
    { email: true, phone: false },
    { email: false, phone: true },
    { email: true, phone: true },
  ])('render the forgot password page with settings %p %p', (settings) => {
    const email = 'foo@logto.io';
    const countryCode = '86';
    const phone = '13911111111';

    const identifierCases = [
      { type: SignInIdentifier.Username, value: '' },
      { type: SignInIdentifier.Email, value: email },
      { type: SignInIdentifier.Phone, value: `${countryCode}${phone}` },
    ];

    test.each(identifierCases)(
      'render the forgot password page with identifier session %o',
      async (identifier) => {
        const { result } = renderHook(() => useSessionStorage());
        const { set, remove } = result.current;
        set(StorageKeys.ForgotPasswordIdentifierInputValue, {
          type: identifier.type,
          value: identifier.value,
        });

        const { queryByText, container, queryByTestId } = renderPage(settings);
        const inputField = container.querySelector('input[name="identifier"]');
        const countryCodeSelectorPrefix = queryByTestId('prefix');

        assert(inputField, new Error('input field not found'));

        expect(queryByText('description.reset_password')).not.toBeNull();
        expect(queryByText('description.reset_password_description')).not.toBeNull();

        expect(queryByText('action.switch_to')).toBeNull();

        if (identifier.type === SignInIdentifier.Phone && settings.phone) {
          expect(inputField.getAttribute('value')).toBe(phone);
          expect(countryCodeSelectorPrefix?.style.width).toBe('100px');
          expect(queryByText(`+${countryCode}`)).not.toBeNull();
        } else if (identifier.type === SignInIdentifier.Phone) {
          // Phone Number not enabled
          expect(inputField.getAttribute('value')).toBe('');
          expect(countryCodeSelectorPrefix?.style.width).toBe('0px');
        }

        if (identifier.type === SignInIdentifier.Email && settings.email) {
          expect(inputField.getAttribute('value')).toBe(email);
          expect(countryCodeSelectorPrefix?.style.width).toBe('0px');
        } else if (identifier.type === SignInIdentifier.Email) {
          // Only PhoneNumber is enabled
          expect(inputField.getAttribute('value')).toBe('');
          expect(countryCodeSelectorPrefix?.style.width).toBe('100px');
        }

        if (identifier.type === SignInIdentifier.Username && settings.email) {
          expect(inputField.getAttribute('value')).toBe('');
          expect(countryCodeSelectorPrefix?.style.width).toBe('0px');
        } else if (identifier.type === SignInIdentifier.Username) {
          // Only PhoneNumber is enabled
          expect(inputField.getAttribute('value')).toBe('');
          expect(countryCodeSelectorPrefix?.style.width).toBe('100px');
        }

        remove(StorageKeys.ForgotPasswordIdentifierInputValue);
      }
    );
  });
});
