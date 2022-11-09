import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import SecondaryRegister from '@/pages/SecondaryRegister';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => 0) }));
jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<SecondaryRegister />', () => {
  test('renders phone', async () => {
    const { queryAllByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/register/sms']}>
        <Routes>
          <Route
            path="/register/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  signUp: {
                    ...mockSignInExperienceSettings.signUp,
                    methods: [SignInIdentifier.Sms],
                  },
                }}
              >
                <SecondaryRegister />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryAllByText('action.create_account')).toHaveLength(2);
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
  });

  test('renders email', async () => {
    const { queryAllByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/register/email']}>
        <Routes>
          <Route
            path="/register/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  signUp: {
                    ...mockSignInExperienceSettings.signUp,
                    methods: [SignInIdentifier.Email],
                  },
                }}
              >
                <SecondaryRegister />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryAllByText('action.create_account')).toHaveLength(2);
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });

  test('renders non-recognized method should return error page', async () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/register/test']}>
        <Routes>
          <Route
            path="/register/:method"
            element={
              <SettingsProvider>
                <SecondaryRegister />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  test('renders non-supported signUp methods should return error page', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/register/email']}>
        <Routes>
          <Route
            path="/register/:method"
            element={
              <SettingsProvider>
                <SecondaryRegister />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  test('render non-verified passwordless methods should return error page', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/register/email']}>
        <Routes>
          <Route
            path="/register/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  signUp: {
                    methods: [SignInIdentifier.Email],
                    password: true,
                    verify: false,
                  },
                }}
              >
                <SecondaryRegister />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  test('render with sign-in only mode', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/register/email']}>
        <Routes>
          <Route
            path="/register/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  signInMode: SignInMode.SignIn,
                }}
              >
                <SecondaryRegister />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
