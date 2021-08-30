import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { signInBasic } from '@/apis/sign-in';
import SignIn from '@/pages/SignIn';

jest.mock('@/apis/sign-in', () => ({ signInBasic: jest.fn(async () => Promise.resolve()) }));

describe('<SignIn />', () => {
  test('renders without exploding', async () => {
    const { queryByText, getByText } = render(<SignIn />);
    expect(queryByText('Sign in to Logto')).not.toBeNull();

    const submit = getByText('sign_in.action');
    fireEvent.click(submit);

    await waitFor(() => {
      expect(signInBasic).toBeCalled();
      expect(queryByText('sign_in.loading')).not.toBeNull();
    });
  });
});
