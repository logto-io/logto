import { SignInMode, SignInIdentifier } from '@logto/schemas';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
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
    expect(queryAllByText('action.sign_in_with')).toHaveLength(
      mockSignInExperienceSettings.socialConnectors.length
    );
  });

  test('renders with email passwordless as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            ...mockSignInExperienceSettings.signUp,
            identifiers: [SignInIdentifier.Email],
          },
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

  test('renders with phone passwordless as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            ...mockSignInExperienceSettings.signUp,
            identifiers: [SignInIdentifier.Phone],
          },
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

  test('render with email and phone passwordless', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            ...mockSignInExperienceSettings.signUp,
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
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
          signUp: { ...mockSignInExperienceSettings.signUp, identifiers: [] },
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
