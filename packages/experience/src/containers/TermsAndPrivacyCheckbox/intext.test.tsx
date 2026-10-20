import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import TermsAndPrivacy from '.';

describe('TermsAndPrivacy Container', () => {
  it('render with empty TermsAndPrivacy settings', () => {
    const { queryByText } = renderWithPageContext(<TermsAndPrivacy />);
    expect(queryByText(/I agree to the/)).toBeNull();
  });

  it('render with settings', async () => {
    const { queryByRole } = renderWithPageContext(
      <SettingsProvider>
        <TermsAndPrivacy />
      </SettingsProvider>
    );

    expect(queryByRole('link', { name: 'Terms and Conditions' })).not.toBeNull();
    expect(queryByRole('link', { name: 'Privacy Policy' })).not.toBeNull();
  });
});
