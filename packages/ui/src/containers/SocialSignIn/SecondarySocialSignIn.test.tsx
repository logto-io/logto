import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { socialConnectors } from '@/__mocks__/logto';

import SecondarySocialSignIn from './SecondarySocialSignIn';

describe('SecondarySocialSignIn', () => {
  it('less than four connectors', () => {
    const { container } = render(
      <MemoryRouter>
        <SecondarySocialSignIn connectors={socialConnectors.slice(0, 3)} />
      </MemoryRouter>
    );
    expect(container.querySelectorAll('button')).toHaveLength(3);
  });

  it('more than four connectors', () => {
    const { container } = render(
      <MemoryRouter>
        <SecondarySocialSignIn connectors={socialConnectors} />
      </MemoryRouter>
    );
    expect(container.querySelectorAll('button')).toHaveLength(4);
  });
});
