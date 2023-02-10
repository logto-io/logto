import type { SignUp } from '@logto/schemas';
import { SignInMode, SignInIdentifier } from '@logto/schemas';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import Register from '@/pages/Register';
import type { SignInExperienceResponse } from '@/types';

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

describe('<Register />', () => {
  const renderRegisterPage = (settings?: Partial<SignInExperienceResponse>) =>
    renderWithPageContext(
      <SettingsProvider settings={{ ...mockSignInExperienceSettings, ...settings }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </SettingsProvider>
    );

  const signUpTestCases: SignUp[] = [
    [SignInIdentifier.Username],
    [SignInIdentifier.Email],
    [SignInIdentifier.Phone],
    [SignInIdentifier.Phone, SignInIdentifier.Email],
  ].map((identifiers) => ({
    identifiers,
    password: true,
    verify: true,
  }));

  test.each(signUpTestCases)('renders with %o sign up settings', async (...signUp) => {
    const { queryByText, queryAllByText, container } = renderRegisterPage();

    expect(container.querySelector('input[name="identifier"]')).not.toBeNull();
    expect(queryByText('action.create_account')).not.toBeNull();

    // Social
    expect(queryAllByText('action.sign_in_with')).toHaveLength(
      mockSignInExperienceSettings.socialConnectors.length
    );
  });

  test('renders with social as primary', async () => {
    const { queryByText, queryAllByText, container } = renderRegisterPage({
      signUp: { ...mockSignInExperienceSettings.signUp, identifiers: [] },
    });

    expect(queryAllByText('action.sign_in_with')).toHaveLength(
      mockSignInExperienceSettings.socialConnectors.length
    );

    expect(container.querySelector('input[name="identifier"]')).toBeNull();
    expect(queryByText('action.create_account')).toBeNull();
  });

  test('render with sign-in only mode should return ErrorPage', () => {
    const { queryByText } = renderRegisterPage({ signInMode: SignInMode.SignIn });
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
