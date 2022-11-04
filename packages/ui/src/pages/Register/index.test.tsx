import { SignInMode, SignInIdentifier } from '@logto/schemas';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { defaultSize } from '@/containers/SocialSignIn/SocialSignInList';
import Register from '@/pages/Register';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<Register />', () => {
  test('renders with username as primary', async () => {
    const { queryAllByText, container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(container.querySelector('input[name="new-username"]')).not.toBeNull();

    // Social
    expect(queryAllByText('action.sign_in_with')).toHaveLength(defaultSize);
  });

  test('renders with email passwordless as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: { ...mockSignInExperienceSettings.signUp, methods: [SignInIdentifier.Email] },
        }}
      >
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.create_account')).not.toBeNull();
  });

  test('renders with sms passwordless as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: { ...mockSignInExperienceSettings.signUp, methods: [SignInIdentifier.Sms] },
        }}
      >
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.create_account')).not.toBeNull();
  });

  test('render with email and sms passwordless', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            ...mockSignInExperienceSettings.signUp,
            methods: [SignInIdentifier.Email, SignInIdentifier.Sms],
          },
        }}
      >
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(queryByText('secondary.register_with')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });

  test('renders with social as primary', async () => {
    const { queryAllByText } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: { ...mockSignInExperienceSettings.signUp, methods: [] },
        }}
      >
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(queryAllByText('action.sign_in_with')).toHaveLength(
      mockSignInExperienceSettings.socialConnectors.length
    );
  });

  test('render with sign-in only mode should return ErrorPage', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider
        settings={{ ...mockSignInExperienceSettings, signInMode: SignInMode.SignIn }}
      >
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
