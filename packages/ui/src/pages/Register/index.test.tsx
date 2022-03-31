import { render } from '@testing-library/react';
import React from 'react';

import Register from '@/pages/Register';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => Promise.resolve()) }));

describe('<Register />', () => {
  test('renders without exploding', async () => {
    const { queryByText } = render(<Register />);
    expect(queryByText('register.create_account')).not.toBeNull();
    expect(queryByText('register.action')).not.toBeNull();
  });
});
