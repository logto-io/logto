import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { registerWithSocial, bindSocialRelatedUser } from '@/apis/social';

import SocialCreateAccount from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { relatedUser: 'foo@logto.io' } }),
}));

jest.mock('@/apis/social', () => ({
  registerWithSocial: jest.fn(async () => 0),
  bindSocialRelatedUser: jest.fn(async () => 0),
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
    expect(queryByText('secondary.social_bind_with')).not.toBeNull();
  });

  it('should call registerWithSocial when click create button', async () => {
    const { getByText } = renderWithPageContext(<SocialCreateAccount connectorId="github" />);
    const createButton = getByText('action.create');

    await waitFor(() => {
      fireEvent.click(createButton);
    });

    expect(registerWithSocial).toBeCalledWith('github');
  });

  it('should render bindUser Button when relatedUserInfo found', async () => {
    const { getByText } = renderWithPageContext(<SocialCreateAccount connectorId="github" />);
    const bindButton = getByText('action.bind');
    await waitFor(() => {
      fireEvent.click(bindButton);
    });
    expect(bindSocialRelatedUser).toBeCalledWith('github');
  });
});
