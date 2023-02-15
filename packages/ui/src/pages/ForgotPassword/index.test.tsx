import { SignInIdentifier } from '@logto/schemas';
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

      const { queryByText, queryAllByText, container } = renderPage(settings);
      const inputField = container.querySelector('input[name="identifier"]');
      const countryCodeSelector = container.querySelector('select[name="countryCode"]');
      assert(inputField, new Error('input field not found'));

      expect(queryByText('description.reset_password')).not.toBeNull();
      expect(queryByText('description.reset_password_description')).not.toBeNull();

      expect(queryByText('action.switch_to')).toBeNull();

      if (state.identifier === SignInIdentifier.Phone && settings.phone) {
        expect(inputField.getAttribute('value')).toBe(phone);
        expect(countryCodeSelector).not.toBeNull();
        expect(queryAllByText(`+${countryCode}`)).toHaveLength(2);
      } else if (state.identifier === SignInIdentifier.Phone) {
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelector).toBeNull();
      }

      if (state.identifier === SignInIdentifier.Email && settings.email) {
        expect(inputField.getAttribute('value')).toBe(email);
        expect(countryCodeSelector).toBeNull();
      } else if (state.identifier === SignInIdentifier.Email) {
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelector).not.toBeNull();
      }

      if (state.identifier === SignInIdentifier.Username && settings.email) {
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelector).toBeNull();
      } else if (state.identifier === SignInIdentifier.Username) {
        expect(inputField.getAttribute('value')).toBe('');
        expect(countryCodeSelector).not.toBeNull();
      }
    });
  });
});
