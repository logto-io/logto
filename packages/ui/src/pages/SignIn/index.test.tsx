import { SignInMode } from '@logto/schemas';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import {
  mockSignInExperienceSettings,
  emailSignInMethod,
  phoneSignInMethod,
} from '@/__mocks__/logto';
import SignIn from '@/pages/SignIn';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<SignIn />', () => {
  test('renders with username as primary', async () => {
    const { queryByText, queryAllByText, container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();

    // Other sign-in methods
    expect(queryByText('secondary.sign_in_with')).not.toBeNull();

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
          signIn: { methods: [emailSignInMethod] },
        }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('render with email password as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signIn: {
            methods: [
              {
                ...emailSignInMethod,
                verificationCode: false,
                password: true,
              },
            ],
          },
        }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('renders with phone passwordless as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{ ...mockSignInExperienceSettings, signIn: { methods: [phoneSignInMethod] } }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('renders with phone password as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signIn: {
            methods: [
              {
                ...phoneSignInMethod,
                verificationCode: false,
                password: true,
              },
            ],
          },
        }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
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
