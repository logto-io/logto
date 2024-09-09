import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ErrorPage from '.';

describe('ErrorPage Page', () => {
  it('render properly', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <ErrorPage title="description.not_found" message="error.invalid_email" />
      </MemoryRouter>
    );
    expect(queryByText('description.not_found')).not.toBeNull();
    expect(queryByText('error.invalid_email')).not.toBeNull();
  });
});
