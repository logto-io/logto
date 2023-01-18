import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import SocialRegister from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({
    state: { relatedUser: { type: 'email', value: 'foo@logto.io' } },
  })),
}));

describe('SocialRegister', () => {
  it('render', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/social/link/github']}>
        <Routes>
          <Route path="/social/link/:connector" element={<SocialRegister />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('description.bind_account_title')).not.toBeNull();
    expect(queryByText('description.social_create_account')).not.toBeNull();
  });
});
