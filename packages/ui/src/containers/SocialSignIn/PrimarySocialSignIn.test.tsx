import { fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { socialConnectors, mockSignInExperienceSettings } from '@/__mocks__/logto';

import PrimarySocialSignIn from './PrimarySocialSignIn';

describe('SecondarySocialSignIn', () => {
  it('less than three connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          socialConnectors: socialConnectors.slice(0, 3),
        }}
      >
        <MemoryRouter>
          <PrimarySocialSignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelectorAll('button')).toHaveLength(3);
  });

  it('more than three connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <PrimarySocialSignIn />
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(container.querySelectorAll('button')).toHaveLength(3);

    const expandButton = container.querySelector('svg');

    if (expandButton) {
      fireEvent.click(expandButton);
    }

    expect(container.querySelectorAll('button')).toHaveLength(socialConnectors.length);
  });
});
