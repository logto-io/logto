import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import SecondarySignIn from '@/pages/SecondarySignIn';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<SecondarySignIn />', () => {
  test('renders without exploding', async () => {
    const { queryAllByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/username']}>
        <Routes>
          <Route
            path="/sign-in/:method"
            element={
              <SettingsProvider>
                <SecondarySignIn />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryAllByText('action.sign_in')).toHaveLength(2);
  });

  test('renders phone', async () => {
    const { queryAllByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/phone']}>
        <Routes>
          <Route
            path="/sign-in/:method"
            element={
              <SettingsProvider>
                <SecondarySignIn />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryAllByText('action.sign_in')).toHaveLength(2);
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
  });

  test('renders email', async () => {
    const { queryAllByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email']}>
        <Routes>
          <Route
            path="/sign-in/:method"
            element={
              <SettingsProvider>
                <SecondarySignIn />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryAllByText('action.sign_in')).toHaveLength(2);
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });

  test('render un-recognized method', async () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/test']}>
        <Routes>
          <Route
            path="/sign-in/:method"
            element={
              <SettingsProvider>
                <SecondarySignIn />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.sign_in')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  test('render un-supported method', async () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email']}>
        <Routes>
          <Route
            path="/sign-in/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  signIn: {
                    methods: mockSignInExperienceSettings.signIn.methods.filter(
                      ({ identifier }) => identifier !== SignInIdentifier.Email
                    ),
                  },
                }}
              >
                <SecondarySignIn />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.sign_in')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  test('render with register only mode', async () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email']}>
        <Routes>
          <Route
            path="/sign-in/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  signInMode: SignInMode.Register,
                }}
              >
                <SecondarySignIn />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.sign_in')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
