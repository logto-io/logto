import type { Language } from '@logto/phrases';
import { Nullable } from '@silverhand/essentials';

export enum ConnectorType {
  Email = 'Email',
  SMS = 'SMS',
  Social = 'Social',
}

export enum ConnectorPlatform {
  Native = 'Native',
  Universal = 'Universal',
  Web = 'Web',
}

export enum ConnectorErrorCodes {
  General,
  InsufficientRequestParameters,
  InvalidConfig,
  InvalidResponse,
  TemplateNotFound,
  NotImplemented,
  SocialAuthCodeInvalid,
  SocialAccessTokenInvalid,
  SocialIdTokenInvalid,
  AuthorizationFailed,
}

type i18nPhrases = { [Language.English]: string } & {
  [key in Exclude<Language, Language.English>]?: string;
};

export type ConnectorMetadata = {
  id: string;
  target: string;
  type: ConnectorType;
  platform: Nullable<ConnectorPlatform>;
  name: i18nPhrases;
  logo: string;
  logoDark: Nullable<string>;
  description: i18nPhrases;
  readme: string;
  configTemplate: string;
};
