import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import ResetPassword from '.';

describe('ForgotPassword', () => {
  it('render email forgot password properly', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.new_password')).not.toBeNull();
  });
});
