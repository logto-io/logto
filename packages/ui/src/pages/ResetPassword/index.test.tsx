import { render } from '@testing-library/react';

import ResetPassword from '.';

describe('ForgotPassword', () => {
  it('render email forgot password properly', () => {
    const { queryByText } = render(<ResetPassword />);

    expect(queryByText('description.new_password')).not.toBeNull();
  });
});
