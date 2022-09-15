import { render } from '@testing-library/react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import ForgetPassword from '.';

describe('ForgetPassword', () => {
  it('render email forget password properly', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/forget-password/email']}>
        <Routes>
          <Route path="/forget-password/:method" element={<ForgetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.reset_password')).not.toBeNull();
    expect(queryByText('description.reset_password_description_email')).not.toBeNull();
  });

  it('render sms forget password properly', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/forget-password/sms']}>
        <Routes>
          <Route path="/forget-password/:method" element={<ForgetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.reset_password')).not.toBeNull();
    expect(queryByText('description.reset_password_description_sms')).not.toBeNull();
  });
});
