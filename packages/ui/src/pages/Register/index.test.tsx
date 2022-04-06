import { render } from '@testing-library/react';
import React from 'react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import Register from '@/pages/Register';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => Promise.resolve()) }));

describe('<Register />', () => {
  test('renders without exploding', async () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Register />
      </MemoryRouter>
    );
    expect(queryByText('register.create_account')).not.toBeNull();
    expect(queryByText('register.action')).not.toBeNull();
  });

  test('renders phone', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/register/phone']}>
        <Routes>
          <Route path="/register/:channel" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('register.create_account')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
  });

  test('renders email', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/register/email']}>
        <Routes>
          <Route path="/register/:channel" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('register.create_account')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });
});
