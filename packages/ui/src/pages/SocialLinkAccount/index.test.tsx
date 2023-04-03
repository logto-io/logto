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
    expect(queryByText('description.bind_account_title')).not.toBeNull();
    expect(queryByText('description.social_create_account')).not.toBeNull();
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
    expect(queryByText('description.link_email')).not.toBeNull();
    expect(queryByText('description.social_link_email')).not.toBeNull();
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
    expect(queryByText('description.link_phone')).not.toBeNull();
    expect(queryByText('description.social_link_phone')).not.toBeNull();
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
    expect(queryByText('description.link_email_or_phone')).not.toBeNull();
    expect(queryByText('description.social_link_email_or_phone')).not.toBeNull();
  });
});
