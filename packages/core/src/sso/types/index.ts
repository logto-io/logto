import { type JsonObject, type SsoConnector } from '@logto/schemas';

/**
 * Single sign-on connector interface
 * @interface SingleSignOn
 *
 * @property {SsoConnector} data - SSO connector data schema
 * @method {getConfig} getConfig - Get the full-list of SSO config from the SSO provider
 */
export abstract class SingleSignOn {
  abstract data: SsoConnector;
  abstract getConfig: () => Promise<JsonObject>;
  abstract getIssuer: () => string;
}

export enum SsoProviderName {
  OIDC = 'OIDC',
  SAML = 'SAML',
}

export type SupportedSsoConnector = Omit<SsoConnector, 'providerName'> & {
  providerName: SsoProviderName;
};
