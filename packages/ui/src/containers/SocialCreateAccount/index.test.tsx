import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { registerWithSocial, bindSocialRelatedUser } from '@/apis/social';

import SocialCreateAccount from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { relatedUser: 'foo@logto.io' } }),
}));

jest.mock('@/apis/social', () => ({
  registerWithSocial: jest.fn(async () => Promise.resolve()),
  bindSocialRelatedUser: jest.fn(async () => Promise.resolve()),
}));

describe('SocialCreateAccount', () => {
  it('should match snapshot', () => {
    const { queryByText } = render(<SocialCreateAccount connector="github" />);
    expect(queryByText('description.social_create_account')).not.toBeNull();
    expect(queryByText('description.social_bind_account')).not.toBeNull();
  });

  it('should redirect to sign in page when click sign-in button', () => {
    const { getByText } = render(<SocialCreateAccount connector="github" />);

    const signInButton = getByText('action.sign_in');
    fireEvent.click(signInButton);
    expect(mockNavigate).toBeCalledWith('/sign-in/username/github');
  });

  it('should call registerWithSocial when click create button', async () => {
    const { getByText } = renderWithPageContext(<SocialCreateAccount connector="github" />);
    const createButton = getByText('action.create');

    await waitFor(() => {
      fireEvent.click(createButton);
    });

    expect(registerWithSocial).toBeCalledWith('github');
  });

  it('should render bindUser Button when relatedUserInfo found', async () => {
    const { getByText } = renderWithPageContext(<SocialCreateAccount connector="github" />);
    const bindButton = getByText('action.bind');
    await waitFor(() => {
      fireEvent.click(bindButton);
    });
    expect(bindSocialRelatedUser).toBeCalledWith('github');
  });
});
