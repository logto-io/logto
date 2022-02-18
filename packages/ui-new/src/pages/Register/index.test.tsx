import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { register } from '@/apis/register';
import Register from '@/pages/Register';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => Promise.resolve()) }));

describe('<Register />', () => {
  test('renders without exploding', async () => {
    const { queryByText, getByText } = render(<Register />);
    expect(queryByText('register.create_account')).not.toBeNull();
    expect(queryByText('register.have_account')).not.toBeNull();

    const submit = getByText('register.action');
    fireEvent.click(submit);

    await waitFor(() => {
      expect(register).toBeCalled();
      expect(queryByText('register.loading')).not.toBeNull();
    });
  });
});
