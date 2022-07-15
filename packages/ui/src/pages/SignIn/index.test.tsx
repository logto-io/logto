import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { defaultSize } from '@/containers/SocialSignIn/SocialSignInList';
import SignIn from '@/pages/SignIn';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<SignIn />', () => {
  test('renders with username as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('renders with email as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{ ...mockSignInExperienceSettings, primarySignInMethod: 'email' }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('renders with sms as primary', async () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider settings={{ ...mockSignInExperienceSettings, primarySignInMethod: 'sms' }}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('renders with social as primary', async () => {
    const { container } = renderWithPageContext(
      <SettingsProvider
        settings={{ ...mockSignInExperienceSettings, primarySignInMethod: 'social' }}
      >
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(container.querySelectorAll('button')).toHaveLength(defaultSize + 1); // Plus Expand Button
  });
});
