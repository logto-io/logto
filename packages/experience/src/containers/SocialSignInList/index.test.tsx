import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { socialConnectors } from '@/__mocks__/logto';

import SocialSignInList from '.';

describe('SocialSignInList', () => {
  it('Display connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider>
        <SocialSignInList socialConnectors={socialConnectors} />
      </SettingsProvider>
    );
    expect(container.querySelectorAll('button')).toHaveLength(socialConnectors.length);
  });
});
