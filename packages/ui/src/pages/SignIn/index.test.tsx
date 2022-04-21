import { render } from '@testing-library/react';
import React from 'react';

import SignIn from '@/pages/SignIn';

describe('<SignIn />', () => {
  test('renders without exploding', async () => {
    const { queryByText } = render(<SignIn />);
    expect(queryByText('action.sign_in')).not.toBeNull();
  });
});
