import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import NotFound from '.';

describe('NotFound Page', () => {
  it('render properly', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(queryByText('404 description.not_found')).not.toBeNull();
  });
});
