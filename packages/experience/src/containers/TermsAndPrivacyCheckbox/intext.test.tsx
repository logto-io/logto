import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import TermsAndPrivacy from '.';

describe('TermsAndPrivacy Container', () => {
  it('render with empty TermsAndPrivacy settings', () => {
    const { queryByText } = renderWithPageContext(<TermsAndPrivacy />);
    expect(queryByText('description.agree_with_terms')).toBeNull();
  });

  it('render with settings', async () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <TermsAndPrivacy />
      </SettingsProvider>
    );

    expect(queryByText('description.agree_with_terms')).not.toBeNull();
  });
});
