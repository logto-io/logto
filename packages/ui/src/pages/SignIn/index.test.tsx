import { render } from '@testing-library/react';
import React from 'react';

import SignIn from '@/pages/SignIn';

describe('<SignIn />', () => {
  test('renders without exploding', async () => {
    const { queryByText } = render(<SignIn />);
    expect(queryByText('Welcome to Logto')).not.toBeNull();
    expect(queryByText('sign_in.action')).not.toBeNull();
  });
});
