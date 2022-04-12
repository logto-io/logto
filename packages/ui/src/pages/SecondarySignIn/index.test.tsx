import { render } from '@testing-library/react';
import React from 'react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import SecondarySignIn from '@/pages/SecondarySignIn';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => Promise.resolve()) }));

describe('<SecondarySignIn />', () => {
  test('renders without exploding', async () => {
    const { queryAllByText } = render(
      <MemoryRouter initialEntries={['/sign-in/username']}>
        <SecondarySignIn />
      </MemoryRouter>
    );
    expect(queryAllByText('action.sign_in')).toHaveLength(2);
  });

  test('renders phone', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/sign-in/sms']}>
        <Routes>
          <Route path="/sign-in/:method" element={<SecondarySignIn />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.sign_in')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
  });

  test('renders email', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/sign-in/email']}>
        <Routes>
          <Route path="/sign-in/:method" element={<SecondarySignIn />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.sign_in')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });
});
