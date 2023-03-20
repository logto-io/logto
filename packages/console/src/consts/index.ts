export * from './applications';
export * from './connectors';
export * from './logs';
export * from './resources';
export * from './tenants';
export * from './page-tabs';
export * from './external-links';

export const appearanceModeStorageKey = 'logto:admin_console:appearance_mode';
export const profileSocialLinkingKeyPrefix = 'logto:admin_console:linking_social_connector';
export const requestTimeout = 20_000;
export const defaultPageSize = 20;

export enum queryParameterKeys {
  signUp = 'sign_up',
}
