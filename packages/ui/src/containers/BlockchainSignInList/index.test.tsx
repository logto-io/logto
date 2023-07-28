import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { blockchainConnectors } from '@/__mocks__/connectors';

import BlockchainSignInList from '.';

describe('BlockchainSignInList', () => {
  it('Display connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider>
        <BlockchainSignInList blockchainConnectors={blockchainConnectors} />
      </SettingsProvider>
    );
    expect(container.querySelectorAll('button')).toHaveLength(blockchainConnectors.length);
  });
});
