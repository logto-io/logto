import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import {
  mockSignInExperienceSettings,
  emailSignInMethod,
  smsSignInMethod,
} from '@/__mocks__/logto';
import { defaultSize } from '@/containers/SocialSignIn/SocialSignInList';
import SignIn from '@/pages/SignIn';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<SignIn />', () => {
  test('renders with username as primary', async () => {
    const { queryByText, queryAllByText, container, debug } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );

    debug();

    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();

    // Other sign-in methods
    expect(queryByText('input.email')).not.toBeNull();
    expect(queryByText('input.phone_number')).not.toBeNull();

    // Social
    expect(queryAllByText('action.sign_in_with')).toHaveLength(defaultSize);
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
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('render with email password as primary', async () => {
    const { queryByText } = renderWithPageContext(
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
    expect(queryByText('email password form')).not.toBeNull();
  });

  test('renders with sms passwordless as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{ ...mockSignInExperienceSettings, signIn: { methods: [smsSignInMethod] } }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('renders with phone password as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signIn: {
            methods: [
              {
                ...smsSignInMethod,
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
    expect(queryByText('Phone password form')).not.toBeNull();
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
});
