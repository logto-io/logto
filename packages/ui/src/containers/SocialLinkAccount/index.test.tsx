import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { registerWithVerifiedSocial, bindSocialRelatedUser } from '@/apis/interaction';

import SocialLinkAccount from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/apis/interaction', () => ({
  registerWithVerifiedSocial: jest.fn(async () => ({ redirectTo: '/' })),
  bindSocialRelatedUser: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('SocialLinkAccount', () => {
  const relatedUser = Object.freeze({ type: 'email', value: 'foo@logto.io' });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render bindUser Button', async () => {
    const { getByText } = renderWithPageContext(
      <SocialLinkAccount connectorId="github" relatedUser={relatedUser} />
    );
    const bindButton = getByText('action.bind');

    await waitFor(() => {
      fireEvent.click(bindButton);
    });

    expect(bindSocialRelatedUser).toBeCalledWith({
      connectorId: 'github',
      email: 'foo@logto.io',
    });
  });

  it('should call registerWithVerifiedSocial when click create button', async () => {
    const { getByText } = renderWithPageContext(
      <SocialLinkAccount connectorId="github" relatedUser={relatedUser} />
    );
    const createButton = getByText('action.create');

    await waitFor(() => {
      fireEvent.click(createButton);
    });

    expect(registerWithVerifiedSocial).toBeCalledWith('github');
  });
});
