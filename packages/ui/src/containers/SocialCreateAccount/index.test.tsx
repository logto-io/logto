import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { registerWithVerifiedSocial, bindSocialRelatedUser } from '@/apis/interaction';

import SocialCreateAccount from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { relatedUser: { type: 'email', value: 'foo@logto.io' } } }),
}));

jest.mock('@/apis/interaction', () => ({
  registerWithVerifiedSocial: jest.fn(async () => ({ redirectTo: '/' })),
  bindSocialRelatedUser: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('SocialCreateAccount', () => {
  it('should render secondary sign-in methods', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <SocialCreateAccount connectorId="github" />
      </SettingsProvider>
    );
    expect(queryByText('description.social_create_account')).not.toBeNull();
    expect(queryByText('description.social_bind_with_existing')).not.toBeNull();
  });

  it('should call registerWithVerifiedSocial when click create button', async () => {
    const { getByText } = renderWithPageContext(<SocialCreateAccount connectorId="github" />);
    const createButton = getByText('action.create');

    await waitFor(() => {
      fireEvent.click(createButton);
    });

    expect(registerWithVerifiedSocial).toBeCalledWith('github');
  });

  it('should render bindUser Button when relatedUserInfo found', async () => {
    const { getByText } = renderWithPageContext(<SocialCreateAccount connectorId="github" />);
    const bindButton = getByText('action.bind');
    await waitFor(() => {
      fireEvent.click(bindButton);
    });
    expect(bindSocialRelatedUser).toBeCalledWith({ connectorId: 'github', identityType: 'email' });
  });
});
