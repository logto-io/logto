import { SignInIdentifier } from '@logto/schemas';
import { Globals } from '@react-spring/web';
import { assert } from '@silverhand/essentials';
import { MemoryRouter, useLocation } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
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
      <MemoryRouter>
        <SettingsProvider
          settings={{
            ...mockSignInExperienceSettings,
            forgotPassword: {
              ...mockSignInExperienceSettings.forgotPassword,
              ...settings,
            },
          }}
        >
          <ForgotPassword />
        </SettingsProvider>
      </MemoryRouter>
    );

  beforeAll(() => {
    Globals.assign({
      skipAnimation: true,
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

    const mockUseLocation = useLocation as jest.Mock;

    const stateCases = [
      {},
      { identifier: SignInIdentifier.Username, value: '' },
      { identifier: SignInIdentifier.Email, value: email },
      { identifier: SignInIdentifier.Phone, value: `${countryCode}${phone}` },
    ];

    test.each(stateCases)('render the forgot password page with state %o', async (state) => {
      mockUseLocation.mockImplementation(() => ({ state }));

      const { queryByText, queryAllByText, container, queryByTestId } = renderPage(settings);
      const inputField = container.querySelector('input[name="identifier"]');
      const countryCodeSelectorPrefix = queryByTestId('prefix');
      assert(inputField, new Error('input field not found'));

      expect(queryByText('description.reset_password')).not.toBeNull();
      expect(queryByText('description.reset_password_description')).not.toBeNull();

      expect(queryByText('action.switch_to')).toBeNull();

      if (state.identifier === SignInIdentifier.Phone && settings.phone) {
        expect(inputField.getAttribute('value')).toBe(phone);

        // Country code select should have a >0 width.
        // The React Spring acquires the child element's width ahead of elementRef is properly set.
        // So the value returns null. Assert style is null to represent the width is >0.
        expect(countryCodeSelectorPrefix?.getAttribute('style')).toBeNull();

        expect(queryAllByText(`+${countryCode}`)).toHaveLength(2);
      } else if (state.identifier === SignInIdentifier.Phone) {
        // Phone Number not enabled
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelectorPrefix?.style.width).toBe('0px');
      }

      if (state.identifier === SignInIdentifier.Email && settings.email) {
        expect(inputField.getAttribute('value')).toBe(email);
        expect(countryCodeSelectorPrefix?.style.width).toBe('0px');
      } else if (state.identifier === SignInIdentifier.Email) {
        // Only PhoneNumber is enabled
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelectorPrefix?.getAttribute('style')).toBeNull();
      }

      if (state.identifier === SignInIdentifier.Username && settings.email) {
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelectorPrefix?.style.width).toBe('0px');
      } else if (state.identifier === SignInIdentifier.Username) {
        // Only PhoneNumber is enabled
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelectorPrefix?.getAttribute('style')).toBeNull();
      }
    });
  });
});
