import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, mockSignInMethodSettingsTestCases } from '@/__mocks__/logto';
import SignIn from '@/pages/SignIn';

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
}));

describe('<SignIn />', () => {
  const renderSignIn = (settings?: Partial<typeof mockSignInExperienceSettings>) =>
    renderWithPageContext(
      <SettingsProvider settings={{ ...mockSignInExperienceSettings, ...settings }}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );

  describe('renders with password only SignIn method settings', () => {
    test.each([
      [SignInIdentifier.Username],
      [SignInIdentifier.Email],
      [SignInIdentifier.Phone],
      [SignInIdentifier.Username, SignInIdentifier.Email],
      [SignInIdentifier.Username, SignInIdentifier.Phone],
      [SignInIdentifier.Email, SignInIdentifier.Phone],
      [SignInIdentifier.Username, SignInIdentifier.Email, SignInIdentifier.Phone],
    ])('renders with %p password only mode', async (...methods) => {
      const { queryByText, queryAllByText, container } = renderSignIn({
        signIn: {
          methods: methods.map((method) => ({
            identifier: method,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          })),
        },
      });

      expect(container.querySelector('input[name="identifier"]')).not.toBeNull();

      expect(queryByText('action.sign_in')).not.toBeNull();

      // Social
      expect(queryAllByText('action.sign_in_with')).toHaveLength(
        mockSignInExperienceSettings.socialConnectors.length
      );
    });
  });

  describe('renders with identifier code only SignIn method settings', () => {
    test.each(mockSignInMethodSettingsTestCases)(
      'renders with [%p %p %p] SignIn Methods only mode',
      async (...methods) => {
        const { container } = renderSignIn({
          signIn: {
            methods,
          },
        });

        expect(container.querySelector('input[name="identifier"]')).not.toBeNull();
        expect(container.querySelector('input[name="password"]')).toBeNull();
      }
    );
  });

  test('renders with social as primary', async () => {
    const { container } = renderWithPageContext(
      <SettingsProvider settings={{ ...mockSignInExperienceSettings, signIn: { methods: [] } }}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(container.querySelectorAll('button')).toHaveLength(
      mockSignInExperienceSettings.socialConnectors.length
    );
  });

  test('render with register only mode should return ErrorPage', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider
        settings={{ ...mockSignInExperienceSettings, signInMode: SignInMode.Register }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
