import { SignInIdentifier } from '@logto/schemas';
import { Routes, Route, MemoryRouter, useLocation } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import SignInPassword from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({})),
}));

describe('SignInPassword', () => {
  const mockUseLocation = useLocation as jest.Mock;
  const email = 'email@logto.io';
  const phone = '18571111111';

  beforeEach(() => {
    mockUseLocation.mockImplementation(() => ({ state: { email, phone } }));
  });

  test('Show error page with unknown method', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/test/password']}>
        <Routes>
          <Route
            path="/sign-in/:method/password"
            element={
              <SettingsProvider>
                <SignInPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.enter_password')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  test('Show error page with unsupported method', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email/password']}>
        <Routes>
          <Route
            path="/sign-in/:method/password"
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
                <SignInPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.enter_password')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  test('Show error page if no address value found', () => {
    mockUseLocation.mockClear();
    mockUseLocation.mockImplementation(() => ({}));
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email/password']}>
        <Routes>
          <Route
            path="/sign-in/:method/password"
            element={
              <SettingsProvider>
                <SignInPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.enter_password')).toBeNull();
    expect(queryByText('error.invalid_email')).not.toBeNull();
  });

  test('/sign-in/email/password', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email/password']}>
        <Routes>
          <Route
            path="/sign-in/:method/password"
            element={
              <SettingsProvider>
                <SignInPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.enter_password')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in_via_passcode')).not.toBeNull();
  });

  test('/sign-in/phone/password', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/phone/password']}>
        <Routes>
          <Route
            path="/sign-in/:method/password"
            element={
              <SettingsProvider>
                <SignInPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.enter_password')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in_via_passcode')).not.toBeNull();
  });

  test('should not render passwordless link if verificationCode is disabled', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email/password']}>
        <Routes>
          <Route
            path="/sign-in/:method/password"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  signIn: {
                    methods: [
                      {
                        identifier: SignInIdentifier.Email,
                        password: true,
                        verificationCode: false,
                        isPasswordPrimary: true,
                      },
                    ],
                  },
                }}
              >
                <SignInPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.enter_password')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in_via_passcode')).toBeNull();
  });
});
