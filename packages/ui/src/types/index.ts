import { Language } from '@logto/phrases-ui';
import { SignInExperience, ConnectorMetadata, AppearanceMode } from '@logto/schemas';

export type UserFlow = 'sign-in' | 'register';
export type SignInMethod = 'username' | 'email' | 'sms' | 'social';
export type LocalSignInMethod = 'username' | 'email' | 'sms';

export enum SearchParameters {
  bindWithSocial = 'bind_with',
  nativeCallbackLink = 'native_callback',
  redirectTo = 'redirect_to',
}

export type Platform = 'web' | 'mobile';

export type Theme = 'dark' | 'light';

// FIXME: @Darcy
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ConnectorData extends ConnectorMetadata {
  id: string;
}

export type SignInExperienceSettingsResponse = SignInExperience & {
  socialConnectors: ConnectorData[];
  notification?: string;
};

export type SignInExperienceSettings = Omit<
  SignInExperienceSettingsResponse,
  'id' | 'signInMethods' | 'socialSignInConnectorTargets'
> & {
  primarySignInMethod: SignInMethod;
  secondarySignInMethods: SignInMethod[];
};

export enum TermsOfUseModalMessage {
  SHOW_DETAIL_MODAL = 'SHOW_DETAIL_MODAL',
}

export type PreviewConfig = {
  signInExperience: SignInExperienceSettingsResponse;
  language: Language;
  mode: AppearanceMode.LightMode | AppearanceMode.DarkMode;
  platform: Platform;
  isNative: boolean;
};
