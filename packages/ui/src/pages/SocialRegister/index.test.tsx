import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import SocialRegister from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SocialRegister', () => {
  it('render null and redirect if no connector found', () => {
    render(
      <MemoryRouter initialEntries={['/social-register']}>
        <Routes>
          <Route path="/social-register" element={<SocialRegister />} />
        </Routes>
      </MemoryRouter>
    );
    expect(mockNavigate).toBeCalledWith('/404');
  });

  it('render with connection', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/social-register/github']}>
        <Routes>
          <Route path="/social-register/:connector" element={<SocialRegister />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('description.bind_account_title')).not.toBeNull();
    expect(queryByText('description.social_create_account')).not.toBeNull();
  });
});
