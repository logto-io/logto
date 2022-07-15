import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { socialConnectors } from '@/__mocks__/logto';
import { ConnectorData } from '@/types';

import SocialSignInDropdown from '.';

const mockInvokeSocialSignIn = jest.fn();

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('@/hooks/use-social', () => () => ({
  invokeSocialSignIn: (connector: ConnectorData) => {
    mockInvokeSocialSignIn(connector);
  },
}));

describe('SocialSignInDropdown', () => {
  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SocialSignInDropdown
            isOpen
            connectors={socialConnectors}
            anchorRef={{ current: document.createElement('div') }}
            onClose={jest.fn}
          />
        </MemoryRouter>
      </SettingsProvider>
    );

    for (const { name } of socialConnectors) {
      expect(queryByText(name.en)).not.toBeNull();
    }
  });

  it('invokeSignIn', () => {
    const { getByText } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SocialSignInDropdown
            isOpen
            connectors={socialConnectors}
            anchorRef={{ current: document.createElement('div') }}
            onClose={jest.fn}
          />
        </MemoryRouter>
      </SettingsProvider>
    );

    if (socialConnectors[0]?.name.en) {
      const socialLink = getByText(socialConnectors[0]?.name.en);
      fireEvent.click(socialLink);
      expect(mockInvokeSocialSignIn).toBeCalledWith(socialConnectors[0]);
    }
  });
});
