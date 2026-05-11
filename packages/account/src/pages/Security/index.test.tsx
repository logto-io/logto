import { AccountCenterControlValue } from '@logto/schemas';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { securityRoute } from '@ac/constants/routes';

import Security from '.';

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: jest.fn().mockResolvedValue('access-token'),
  }),
}));

describe('<Security />', () => {
  it('renders visible security sections with mocked account context', () => {
    const { queryAllByText, queryByText } = renderWithPageContext(
      <Routes>
        <Route path={securityRoute} element={<Security />} />
      </Routes>,
      {
        initialEntries: [securityRoute],
        future: {
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        },
      },
      {
        pageContext: {
          accountCenterSettings: {
            ...mockAccountCenterSettings,
            fields: {
              ...mockAccountCenterSettings.fields,
              social: AccountCenterControlValue.Off,
              mfa: AccountCenterControlValue.Off,
            },
            deleteAccountUrl: null,
          },
          experienceSettings: {
            ...mockSignInExperienceSettings,
            socialConnectors: [],
          },
        },
      }
    );

    expect(queryByText('account_center.page.security_title')).not.toBeNull();
    expect(queryByText('account_center.page.security_description')).not.toBeNull();

    expect(queryAllByText('input.username')).toHaveLength(2);
    expect(queryByText('alex')).not.toBeNull();

    expect(queryByText('account_center.security.email_phone')).not.toBeNull();
    expect(queryByText('account_center.security.email')).not.toBeNull();
    expect(queryByText('alex@example.com')).not.toBeNull();
    expect(queryByText('account_center.security.phone')).not.toBeNull();
    expect(queryByText('+1 415 555 0100')).not.toBeNull();

    expect(queryAllByText('account_center.security.password')).toHaveLength(2);
    expect(queryByText('account_center.security.configured')).not.toBeNull();
  });
});
