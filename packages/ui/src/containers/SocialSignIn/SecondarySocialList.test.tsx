import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { socialConnectors } from '@/__mocks__/logto';

import SecondarySocialList from './SecondarySocialList';

describe('SecondarySocialList', () => {
  it('less than four connector', () => {
    const { container } = render(
      <MemoryRouter>
        <SecondarySocialList connectors={socialConnectors.slice(0, 3)} />
      </MemoryRouter>
    );
    expect(container.querySelectorAll('button')).toHaveLength(3);
  });

  it('more than four connector', () => {
    const { container } = render(
      <MemoryRouter>
        <SecondarySocialList connectors={socialConnectors} />
      </MemoryRouter>
    );
    expect(container.querySelectorAll('button')).toHaveLength(4);
  });
});
