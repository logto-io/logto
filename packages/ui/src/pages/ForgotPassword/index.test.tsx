import { Routes, Route, MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import ForgotPassword from '.';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('ForgotPassword', () => {
  it('render email forgot password properly with phone enabled as well', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/email']}>
        <Routes>
          <Route
            path="/forgot-password/:method"
            element={
              <SettingsProvider>
                <ForgotPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.reset_password')).not.toBeNull();
    expect(queryByText('description.reset_password_description_email')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.switch_to')).not.toBeNull();
  });

  it('render phone forgot password properly with email disabled', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/phone']}>
        <Routes>
          <Route
            path="/forgot-password/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  forgotPassword: { email: false, phone: true },
                }}
              >
                <ForgotPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.reset_password')).not.toBeNull();
    expect(queryByText('description.reset_password_description_phone')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.switch_to')).toBeNull();
  });

  it('should return error page if forgot password is not enabled', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/phone']}>
        <Routes>
          <Route
            path="/forgot-password/:method"
            element={
              <SettingsProvider
                settings={{
                  ...mockSignInExperienceSettings,
                  forgotPassword: { email: true, phone: false },
                }}
              >
                <ForgotPassword />
              </SettingsProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.reset_password')).toBeNull();
    expect(queryByText('description.reset_password_description_phone')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
