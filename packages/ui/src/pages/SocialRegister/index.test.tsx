import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import SocialRegister from '.';

describe('SocialRegister', () => {
  it('render', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/social/register/github']}>
        <Routes>
          <Route path="/social/register/:connector" element={<SocialRegister />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('description.bind_account_title')).not.toBeNull();
    expect(queryByText('description.social_create_account')).not.toBeNull();
  });
});
