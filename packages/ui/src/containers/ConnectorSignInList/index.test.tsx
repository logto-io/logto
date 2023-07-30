import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { connectors } from '@/__mocks__/connectors';

import ConnectorSignInList from '.';

describe('ConnectorSignInList', () => {
  it('Display connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider>
        <ConnectorSignInList connectors={connectors} />
      </SettingsProvider>
    );
    expect(container.querySelectorAll('button')).toHaveLength(connectors.length);
  });
});
