import type { SignInExperienceResponse } from '@experience/shared/types';
import {
  AccountCenterControlValue,
  AgreeToTermsPolicy,
  MfaFactor,
  MfaPolicy,
  SignInIdentifier,
  SignInMode,
  Theme,
  type AccountCenter,
  type UserProfileResponse,
} from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import type { Queries, queries, RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import LoadingContext, {
  type LoadingContextValue,
} from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext, { type PageContextType } from '@ac/Providers/PageContextProvider/PageContext';

export const mockAccountCenterSettings = {
  tenantId: 'default',
  id: 'default',
  enabled: true,
  fields: {
    name: AccountCenterControlValue.Edit,
    avatar: AccountCenterControlValue.Edit,
    profile: AccountCenterControlValue.Edit,
    email: AccountCenterControlValue.Edit,
    phone: AccountCenterControlValue.Edit,
    password: AccountCenterControlValue.Edit,
    username: AccountCenterControlValue.Edit,
    social: AccountCenterControlValue.Edit,
    customData: AccountCenterControlValue.Edit,
    mfa: AccountCenterControlValue.Edit,
    session: AccountCenterControlValue.Edit,
  },
  profileFields: [],
  webauthnRelatedOrigins: [],
  deleteAccountUrl: null,
  customCss: null,
} satisfies AccountCenter;

export const mockSignInExperienceSettings = {
  tenantId: 'default',
  id: 'default',
  color: {
    primaryColor: '#000000',
    isDarkModeEnabled: true,
    darkPrimaryColor: '#ffffff',
  },
  branding: {
    logoUrl: 'https://example.com/logo.png',
  },
  hideLogtoBranding: false,
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
  },
  termsOfUseUrl: null,
  privacyPolicyUrl: null,
  agreeToTermsPolicy: AgreeToTermsPolicy.ManualRegistrationOnly,
  signIn: {
    methods: [
      {
        identifier: SignInIdentifier.Username,
        password: true,
        verificationCode: false,
        isPasswordPrimary: true,
      },
      {
        identifier: SignInIdentifier.Email,
        password: true,
        verificationCode: true,
        isPasswordPrimary: true,
      },
      {
        identifier: SignInIdentifier.Phone,
        password: true,
        verificationCode: true,
        isPasswordPrimary: true,
      },
    ],
  },
  signUp: {
    identifiers: [SignInIdentifier.Email],
    password: true,
    verify: true,
  },
  socialSignIn: {},
  socialConnectors: [],
  ssoConnectors: [],
  signInMode: SignInMode.SignInAndRegister,
  forgotPassword: {
    email: true,
    phone: true,
  },
  customCss: null,
  customContent: {},
  customUiAssets: null,
  customUiCsp: {},
  passwordPolicy: {},
  mfa: {
    policy: MfaPolicy.PromptAtSignInAndSignUp,
    factors: [
      MfaFactor.TOTP,
      MfaFactor.WebAuthn,
      MfaFactor.BackupCode,
      MfaFactor.EmailVerificationCode,
      MfaFactor.PhoneVerificationCode,
    ],
  },
  adaptiveMfa: {},
  singleSignOnEnabled: true,
  supportEmail: null,
  supportWebsiteUrl: null,
  unknownSessionRedirectUrl: null,
  captchaPolicy: {},
  sentinelPolicy: {},
  emailBlocklistPolicy: {},
  passkeySignIn: {},
  isDevelopmentTenant: false,
  signUpProfileFields: null,
} satisfies SignInExperienceResponse;

export const mockUserInfo = {
  id: 'user-id',
  username: 'alex',
  primaryEmail: 'alex@example.com',
  primaryPhone: '+14155550100',
  name: 'Alex',
  avatar: null,
  customData: {},
  identities: {},
  profile: {},
  hasPassword: true,
} satisfies Partial<UserProfileResponse>;

const noopAsync = async (): Promise<void> => undefined;
const clone = <T,>(value: T): T => structuredClone(value);

export const createMockPageContext = (
  overrides: Partial<PageContextType> = {}
): PageContextType => ({
  theme: Theme.Light,
  toast: '',
  platform: 'web',
  setTheme: noop,
  setToast: noop,
  experienceSettings: clone(mockSignInExperienceSettings),
  setExperienceSettings: noop,
  accountCenterSettings: clone(mockAccountCenterSettings),
  setAccountCenterSettings: noop,
  userInfo: clone(mockUserInfo),
  refreshUserInfo: noopAsync,
  userInfoError: undefined,
  isLoadingUserInfo: false,
  verificationId: undefined,
  setVerificationId: noop,
  isLoadingExperience: false,
  experienceError: undefined,
  ...overrides,
});

export const createMockLoadingContext = (
  overrides: Partial<LoadingContextValue> = {}
): LoadingContextValue => ({
  loading: false,
  setLoading: noop,
  ...overrides,
});

type RenderWithPageContextOptions<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
> = RenderOptions<Q, Container> & {
  readonly pageContext?: Partial<PageContextType>;
  readonly loadingContext?: Partial<LoadingContextValue>;
};

const renderWithPageContext = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
>(
  ui: ReactElement,
  memoryRouterProps: Parameters<typeof MemoryRouter>[0] = {},
  options: RenderWithPageContextOptions<Q, Container> = {}
) => {
  const { pageContext, loadingContext, ...renderOptions } = options;

  return render<Q, Container>(
    <MemoryRouter {...memoryRouterProps}>
      <LoadingContext.Provider value={createMockLoadingContext(loadingContext)}>
        <PageContext.Provider value={createMockPageContext(pageContext)}>{ui}</PageContext.Provider>
      </LoadingContext.Provider>
    </MemoryRouter>,
    renderOptions
  );
};

export default renderWithPageContext;
