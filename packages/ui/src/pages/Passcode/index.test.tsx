import { render } from '@testing-library/react';
import React from 'react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import Passcode from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    state: { email: 'foo@logto.io' },
  }),
}));

describe('Passcode Page', () => {
  it('render with invalid channel should lead to 404 page', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/sign-in/username/passcode-validation']}>
        <Routes>
          <Route path="/:type/:channel/passcode-validation" element={<Passcode />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).toBeNull();
  });

  it('render properly', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/sign-in/email/passcode-validation']}>
        <Routes>
          <Route path="/:type/:channel/passcode-validation" element={<Passcode />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).not.toBeNull();
    expect(queryByText('description.enter_passcode')).not.toBeNull();
  });
});
