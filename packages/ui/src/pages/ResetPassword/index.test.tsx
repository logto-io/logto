import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import ResetPassword from '.';

describe('ForgotPassword', () => {
  it('render forgot-password page properly', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.new_password')).not.toBeNull();
  });
});
