import { SignInIdentifier } from '@logto/schemas';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import SocialRegister from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({
    state: { relatedUser: { type: 'email', value: 'foo@logto.io' } },
  })),
}));

describe('SocialRegister', () => {
  it('render', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <Routes>
          <Route path="/social/link/:connectorId" element={<SocialRegister />} />
        </Routes>
      </SettingsProvider>,
      { initialEntries: ['/social/link/github'] }
    );
    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.create_account_without_linking')).not.toBeNull();
  });

  it('render link email', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            identifiers: [SignInIdentifier.Email],
            verify: true,
            password: true,
          },
        }}
      >
        <Routes>
          <Route path="/social/link/:connectorId" element={<SocialRegister />} />
        </Routes>
      </SettingsProvider>,
      { initialEntries: ['/social/link/github'] }
    );
    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.link_another_email')).not.toBeNull();
  });

  it('render link phone', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            identifiers: [SignInIdentifier.Phone],
            verify: true,
            password: true,
          },
        }}
      >
        <Routes>
          <Route path="/social/link/:connectorId" element={<SocialRegister />} />
        </Routes>
      </SettingsProvider>,
      { initialEntries: ['/social/link/github'] }
    );
    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.link_another_phone')).not.toBeNull();
  });

  it('render link email or phone', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            identifiers: [SignInIdentifier.Phone, SignInIdentifier.Email],
            verify: true,
            password: true,
          },
        }}
      >
        <Routes>
          <Route path="/social/link/:connectorId" element={<SocialRegister />} />
        </Routes>
      </SettingsProvider>,
      { initialEntries: ['/social/link/github'] }
    );
    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.link_another_email_or_phone')).not.toBeNull();
  });
});
