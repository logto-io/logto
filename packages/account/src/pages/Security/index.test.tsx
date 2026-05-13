import type { SignInExperienceResponse } from '@experience/shared/types';
import {
  AccountCenterControlValue,
  ConnectorPlatform,
  type AccountCenter,
  type UserProfileResponse,
} from '@logto/schemas';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import { securityRoute } from '@ac/constants/routes';

import Security from '.';

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: jest.fn().mockResolvedValue('access-token'),
  }),
}));

type SecurityRenderOptions = {
  readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
    readonly fields?: Partial<AccountCenter['fields']>;
  };
  readonly experienceSettings?: Omit<Partial<SignInExperienceResponse>, 'mfa'> & {
    readonly mfa?: Partial<SignInExperienceResponse['mfa']>;
  };
  readonly userInfo?: Partial<UserProfileResponse>;
};

const googleWebConnector = {
  id: 'google-web',
  target: 'google',
  platform: ConnectorPlatform.Web,
  name: { en: 'Google' },
  logo: 'https://example.com/google.svg',
  logoDark: 'https://example.com/google-dark.svg',
};

const googleNativeConnector = {
  ...googleWebConnector,
  id: 'google-native',
  platform: ConnectorPlatform.Native,
};

const renderSecurity = ({
  accountCenterSettings,
  experienceSettings,
  userInfo,
}: SecurityRenderOptions = {}) => {
  const { fields, ...accountCenterSettingsOverrides } = accountCenterSettings ?? {};
  const { mfa, ...experienceSettingsOverrides } = experienceSettings ?? {};

  return renderWithPageContext(
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
            ...fields,
          },
          deleteAccountUrl: null,
          ...accountCenterSettingsOverrides,
        },
        experienceSettings: {
          ...mockSignInExperienceSettings,
          socialConnectors: [],
          mfa: {
            ...mockSignInExperienceSettings.mfa,
            factors: [],
            ...mfa,
          },
          ...experienceSettingsOverrides,
        },
        userInfo: {
          ...mockUserInfo,
          ...userInfo,
        },
      },
    }
  );
};

describe('<Security />', () => {
  it('renders editable fields with expected sections and edit entries', () => {
    const { queryAllByText, queryByText } = renderSecurity();

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
    expect(queryAllByText('account_center.security.change')).toHaveLength(4);
    expect(queryAllByText('account_center.security.remove')).toHaveLength(3);
  });

  it('renders read-only fields in display-only state', () => {
    const { queryAllByText, queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.ReadOnly,
          email: AccountCenterControlValue.ReadOnly,
          phone: AccountCenterControlValue.ReadOnly,
          password: AccountCenterControlValue.ReadOnly,
          social: AccountCenterControlValue.ReadOnly,
        },
      },
      experienceSettings: {
        socialConnectors: [googleWebConnector],
      },
    });

    expect(queryAllByText('input.username')).toHaveLength(2);
    expect(queryByText('alex')).not.toBeNull();
    expect(queryByText('account_center.security.email_phone')).not.toBeNull();
    expect(queryByText('alex@example.com')).not.toBeNull();
    expect(queryByText('+1 415 555 0100')).not.toBeNull();
    expect(queryAllByText('account_center.security.password')).toHaveLength(2);
    expect(queryByText('account_center.security.configured')).not.toBeNull();
    expect(queryByText('account_center.security.social_sign_in')).not.toBeNull();
    expect(queryByText('Google')).not.toBeNull();
    expect(queryByText('account_center.security.social_not_linked')).not.toBeNull();
    expect(queryByText('account_center.security.add')).toBeNull();
    expect(queryByText('account_center.security.change')).toBeNull();
    expect(queryByText('account_center.security.remove')).toBeNull();
  });

  it('hides off and unavailable sections', () => {
    const { queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [],
        },
      },
    });

    expect(queryByText('input.username')).toBeNull();
    expect(queryByText('account_center.security.email_phone')).toBeNull();
    expect(queryByText('account_center.security.password')).toBeNull();
    expect(queryByText('account_center.security.social_sign_in')).toBeNull();
    expect(queryByText('account_center.security.two_step_verification')).toBeNull();
    expect(queryByText('account_center.security.account_removal')).toBeNull();
  });

  it('renders social section only when available web social connectors exist', () => {
    const { queryByText, unmount } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        socialConnectors: [googleNativeConnector],
      },
    });

    expect(queryByText('account_center.security.social_sign_in')).toBeNull();
    expect(queryByText('Google')).toBeNull();

    unmount();

    const visibleSocialSection = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        socialConnectors: [googleWebConnector],
      },
    });

    expect(
      visibleSocialSection.queryByText('account_center.security.social_sign_in')
    ).not.toBeNull();
    expect(visibleSocialSection.queryByText('Google')).not.toBeNull();
    expect(
      visibleSocialSection.queryByText('account_center.security.social_not_linked')
    ).not.toBeNull();
    expect(visibleSocialSection.queryByText('account_center.security.add')).not.toBeNull();
  });

  it('renders delete account section only when delete account URL is configured', () => {
    const { queryByText, unmount } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
        },
      },
    });

    expect(queryByText('account_center.security.account_removal')).toBeNull();

    unmount();

    const deleteAccountUrl = 'https://example.com/delete-account';
    const visibleDeleteSection = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
        },
        deleteAccountUrl,
      },
    });

    expect(
      visibleDeleteSection.queryByText('account_center.security.account_removal')
    ).not.toBeNull();
    expect(
      visibleDeleteSection.queryByText('account_center.security.delete_your_account')
    ).not.toBeNull();
    expect(
      visibleDeleteSection
        .queryByText('account_center.security.delete_account')
        ?.closest('a')
        ?.getAttribute('href')
    ).toBe(deleteAccountUrl);
  });
});
