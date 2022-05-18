import {
  Branding,
  LanguageInfo,
  TermsOfUse,
  SignInExperience,
  ConnectorMetadata,
} from '@logto/schemas';

export type UserFlow = 'sign-in' | 'register';
export type SignInMethod = 'username' | 'email' | 'sms' | 'social';
export type LocalSignInMethod = 'username' | 'email' | 'sms';

export enum SearchParameters {
  bindWithSocial = 'bw',
}

export type Platform = 'web' | 'mobile';

export type Theme = 'dark' | 'light';

export interface ConnectorData extends ConnectorMetadata {
  id: string;
}

export type SignInExperienceSettingsResponse = SignInExperience & {
  socialConnectors: ConnectorData[];
};

export type SignInExperienceSettings = {
  branding: Branding;
  languageInfo: LanguageInfo;
  termsOfUse: TermsOfUse;
  primarySignInMethod: SignInMethod;
  secondarySignInMethods: SignInMethod[];
  socialConnectors: ConnectorData[];
};
