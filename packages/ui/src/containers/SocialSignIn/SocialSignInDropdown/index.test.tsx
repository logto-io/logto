import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { socialConnectors } from '@/__mocks__/logto';

import SocialSignInDropdown from '.';

describe('SocialSignInDropdown', () => {
  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SocialSignInDropdown isOpen connectors={socialConnectors} onClose={jest.fn} />
        </MemoryRouter>
      </SettingsProvider>
    );

    for (const { name } of socialConnectors) {
      expect(queryByText(name.en)).not.toBeNull();
    }
  });
});
