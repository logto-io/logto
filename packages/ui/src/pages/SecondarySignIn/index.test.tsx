import { render } from '@testing-library/react';
import React from 'react';
import { Route, MemoryRouter } from 'react-router-dom';

import SecondarySignIn from '@/pages/SecondarySignIn';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => Promise.resolve()) }));

describe('<SecondarySignIn />', () => {
  test('renders without exploding', async () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/sign-in/username']}>
        <SecondarySignIn />
      </MemoryRouter>
    );
    expect(queryByText('sign_in.sign_in')).not.toBeNull();
    expect(queryByText('sign_in.action')).not.toBeNull();
  });

  test('renders phone', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/sign-in/phone']}>
        <Route path="/sign-in/:channel">
          <SecondarySignIn />
        </Route>
      </MemoryRouter>
    );
    expect(queryByText('sign_in.sign_in')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
  });

  test('renders email', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/sign-in/email']}>
        <Route path="/sign-in/:channel">
          <SecondarySignIn />
        </Route>
      </MemoryRouter>
    );
    expect(queryByText('sign_in.sign_in')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });
});
