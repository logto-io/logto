import { render } from '@testing-library/react';
import React from 'react';
import { Route, MemoryRouter } from 'react-router-dom';

import Passcode from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    state: { email: 'foo@logto.io' },
  }),
}));

describe('Passcode Page', () => {
  it('render with invalid type should lead to 404 page', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/foo/phone/passcode-validation']}>
        <Route path="/:type/:channel/passcode-validation">
          <Passcode />
        </Route>
      </MemoryRouter>
    );

    expect(queryByText('sign_in.enter_passcode')).toBeNull();
  });

  it('render with invalid channel should lead to 404 page', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/sign-in/username/passcode-validation']}>
        <Route path="/:type/:channel/passcode-validation">
          <Passcode />
        </Route>
      </MemoryRouter>
    );

    expect(queryByText('sign_in.enter_passcode')).toBeNull();
  });

  it('render properly', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/sign-in/email/passcode-validation']}>
        <Route path="/:type/:channel/passcode-validation">
          <Passcode />
        </Route>
      </MemoryRouter>
    );

    expect(queryByText('sign_in.enter_passcode')).not.toBeNull();
    expect(queryByText('sign_in.passcode_sent')).not.toBeNull();
  });
});
