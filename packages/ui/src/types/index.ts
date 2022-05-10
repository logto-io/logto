import { Branding, LanguageInfo, TermsOfUse, ConnectorMetadata } from '@logto/schemas';

export type UserFlow = 'sign-in' | 'register';
export type SignInMethod = 'username' | 'email' | 'sms' | 'social';
export type LocalSignInMethod = 'username' | 'email' | 'sms';

export enum SearchParameters {
  bindWithSocial = 'bw',
}

type ConnectorData = Pick<ConnectorMetadata, 'target' | 'logo' | 'name'>;

export type SignInExperienceSettings = {
  branding: Branding;
  languageInfo: LanguageInfo;
  termsOfUse: TermsOfUse;
  primarySignInMethod: SignInMethod;
  secondarySignInMethods: SignInMethod[];
  socialConnectors: ConnectorData[];
};
