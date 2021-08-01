import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import App from '@/pages/Register';
import { register } from '@/apis/register';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => Promise.resolve()) }));

describe('<App />', () => {
  test('renders without exploding', async () => {
    const { queryByText, getByText } = render(<App />);
    expect(queryByText('register.create_account')).not.toBeNull();
    expect(queryByText('register.have_account')).not.toBeNull();

    const submit = getByText('register.title');
    fireEvent.click(submit);

    await waitFor(() => {
      expect(register).toBeCalled();
      expect(queryByText('register.loading')).not.toBeNull();
    });
  });
});
