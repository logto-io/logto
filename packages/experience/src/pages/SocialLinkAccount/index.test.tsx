import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { renderHook } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

import SocialRegister from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({
    state: { relatedUser: { type: 'email', value: 'foo@logto.io' } },
  })),
}));

const verificationIdsMap = { [VerificationType.Social]: 'foo' };

describe('SocialLinkAccount', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set } = result.current;

  beforeAll(() => {
    set(StorageKeys.verificationIds, verificationIdsMap);
  });

  it('render', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <UserInteractionContextProvider>
          <Routes>
            <Route path="/social/link/:connectorId" element={<SocialRegister />} />
          </Routes>
        </UserInteractionContextProvider>
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
        <UserInteractionContextProvider>
          <Routes>
            <Route path="/social/link/:connectorId" element={<SocialRegister />} />
          </Routes>
        </UserInteractionContextProvider>
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
        <UserInteractionContextProvider>
          <Routes>
            <Route path="/social/link/:connectorId" element={<SocialRegister />} />
          </Routes>
        </UserInteractionContextProvider>
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
        <UserInteractionContextProvider>
          <Routes>
            <Route path="/social/link/:connectorId" element={<SocialRegister />} />
          </Routes>
        </UserInteractionContextProvider>
      </SettingsProvider>,
      { initialEntries: ['/social/link/github'] }
    );
    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.link_another_email_or_phone')).not.toBeNull();
  });
});
