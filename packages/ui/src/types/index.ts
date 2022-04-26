import { Branding, LanguageInfo, TermsOfUse, ConnectorMetadata } from '@logto/schemas';

export type UserFlow = 'sign-in' | 'register';
export type SignInMethod = 'username' | 'email' | 'sms' | 'social';
export type LocalSignInMethod = 'username' | 'email' | 'sms';

type ConnectorData = Pick<ConnectorMetadata, 'id' | 'logo' | 'name'>;

export type SignInExperienceSettings = {
  branding: Branding;
  languageInfo: LanguageInfo;
  termsOfUse: TermsOfUse;
  primarySignInMethod: SignInMethod;
  secondarySignInMethods: SignInMethod[];
  socialConnectors: ConnectorData[];
};
