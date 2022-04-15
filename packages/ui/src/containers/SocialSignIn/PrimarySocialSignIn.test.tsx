import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { socialConnectors } from '@/__mocks__/logto';

import PrimarySocialSignIn from './PrimarySocialSignIn';

describe('SecondarySocialSignIn', () => {
  it('less than three connectors', () => {
    const { container } = render(
      <MemoryRouter>
        <PrimarySocialSignIn connectors={socialConnectors.slice(0, 3)} />
      </MemoryRouter>
    );
    expect(container.querySelectorAll('button')).toHaveLength(3);
  });

  it('more than three connectors', () => {
    const { container } = render(
      <MemoryRouter>
        <PrimarySocialSignIn connectors={socialConnectors} />
      </MemoryRouter>
    );

    expect(container.querySelectorAll('button')).toHaveLength(3);

    const expandButton = container.querySelector('svg');

    if (expandButton) {
      fireEvent.click(expandButton);
    }

    expect(container.querySelectorAll('button')).toHaveLength(socialConnectors.length);
  });
});
