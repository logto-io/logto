import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { bindSocialRelatedUser, registerWithVerifiedIdentifier } from '@/apis/experience';

import SocialLinkAccount from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/apis/experience', () => ({
  registerWithVerifiedIdentifier: jest.fn(async () => ({ redirectTo: '/' })),
  bindSocialRelatedUser: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('SocialLinkAccount', () => {
  const relatedUser = Object.freeze({ type: 'email', value: 'foo@logto.io' });
  const verificationId = 'foo';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render bindUser Button', async () => {
    const { getByText } = renderWithPageContext(
      <SettingsProvider>
        <SocialLinkAccount
          connectorId="github"
          relatedUser={relatedUser}
          verificationId={verificationId}
        />
      </SettingsProvider>
    );
    const bindButton = getByText('action.bind');

    await waitFor(() => {
      fireEvent.click(bindButton);
    });

    expect(bindSocialRelatedUser).toBeCalledWith(verificationId);
  });

  it('should render link email with email signUp identifier', () => {
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
        <SocialLinkAccount
          connectorId="github"
          relatedUser={relatedUser}
          verificationId={verificationId}
        />
      </SettingsProvider>
    );

    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.link_another_email')).not.toBeNull();
  });

  it('should render link phone with phone signUp identifier', () => {
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
        <SocialLinkAccount
          connectorId="github"
          relatedUser={relatedUser}
          verificationId={verificationId}
        />
      </SettingsProvider>
    );

    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.link_another_phone')).not.toBeNull();
  });

  it('should render link phone or email with phone and email signUp identifiers', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
            verify: true,
            password: true,
          },
        }}
      >
        <SocialLinkAccount
          connectorId="github"
          relatedUser={relatedUser}
          verificationId={verificationId}
        />
      </SettingsProvider>
    );

    expect(queryByText('description.skip_social_linking')).not.toBeNull();
    expect(queryByText('action.link_another_email_or_phone')).not.toBeNull();
  });

  it('should call registerWithVerifiedSocial when click create button', async () => {
    const { getByText } = renderWithPageContext(
      <SettingsProvider>
        <SocialLinkAccount
          connectorId="github"
          relatedUser={relatedUser}
          verificationId={verificationId}
        />
      </SettingsProvider>
    );
    const createButton = getByText('action.create_account_without_linking');

    await waitFor(() => {
      fireEvent.click(createButton);
    });

    expect(registerWithVerifiedIdentifier).toBeCalledWith(verificationId);
  });
});
