import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { socialConnectors } from '@/__mocks__/logto';

import SocialSignInList, { defaultSize } from '.';

describe('SocialSignInList', () => {
  it('less than three connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SocialSignInList socialConnectors={socialConnectors.slice(0, defaultSize)} />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelectorAll('button')).toHaveLength(defaultSize);
  });

  it('more than three connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SocialSignInList socialConnectors={socialConnectors} />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(container.querySelectorAll('button')).toHaveLength(defaultSize + 1); // Expand button

    const expandButton = container.querySelector('svg');

    if (expandButton) {
      fireEvent.click(expandButton);
    }

    expect(container.querySelectorAll('button')).toHaveLength(socialConnectors.length + 1); // Expand button
  });
});
