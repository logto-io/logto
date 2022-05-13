import {
  Branding,
  LanguageInfo,
  TermsOfUse,
  ConnectorMetadata,
  ConnectorPlatform,
} from '@logto/schemas';

export type UserFlow = 'sign-in' | 'register';
export type SignInMethod = 'username' | 'email' | 'sms' | 'social';
export type LocalSignInMethod = 'username' | 'email' | 'sms';

export enum SearchParameters {
  bindWithSocial = 'bw',
}

export interface ConnectorData extends ConnectorMetadata {
  id: string;
  platform: ConnectorPlatform;
}

export type SignInExperienceSettings = {
  branding: Branding;
  languageInfo: LanguageInfo;
  termsOfUse: TermsOfUse;
  primarySignInMethod: SignInMethod;
  secondarySignInMethods: SignInMethod[];
  socialConnectors: ConnectorData[];
};
