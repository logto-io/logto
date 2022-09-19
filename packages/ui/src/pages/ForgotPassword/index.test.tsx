import { Routes, Route, MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';

import ForgotPassword from '.';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('ForgotPassword', () => {
  it('render email forgot password properly', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/email']}>
        <Routes>
          <Route path="/forgot-password/:method" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.reset_password')).not.toBeNull();
    expect(queryByText('description.reset_password_description_email')).not.toBeNull();
  });

  it('render sms forgot password properly', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/sms']}>
        <Routes>
          <Route path="/forgot-password/:method" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('description.reset_password')).not.toBeNull();
    expect(queryByText('description.reset_password_description_sms')).not.toBeNull();
  });
});
