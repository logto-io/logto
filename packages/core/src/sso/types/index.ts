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
}

export enum SsoProviderName {
  OIDC = 'OIDC',
}

export type SupportedSsoConnector = Omit<SsoConnector, 'providerName'> & {
  providerName: SsoProviderName;
};
