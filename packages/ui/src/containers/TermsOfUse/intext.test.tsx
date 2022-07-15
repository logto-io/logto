import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import TermsOfUse from '.';

describe('TermsOfUse Container', () => {
  it('render with empty TermsOfUse settings', () => {
    const { queryByText } = renderWithPageContext(<TermsOfUse />);
    expect(queryByText('description.agree_with_terms')).toBeNull();
  });

  it('render with settings', async () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <TermsOfUse />
      </SettingsProvider>
    );

    expect(queryByText('description.agree_with_terms')).not.toBeNull();
  });
});
