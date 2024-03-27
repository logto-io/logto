import { type SsoProviderName, type JsonObject, type SsoConnector } from '@logto/schemas';

// Pick the required fields from SsoConnector Schema
// providerName must be supported by the SSO connector factories
export type SingleSignOnConnectorData = Pick<SsoConnector, 'config' | 'id'> & {
  providerName: SsoProviderName;
};

/**
 * Single sign-on connector interface
 * @interface SingleSignOn
 *
 * @property {SsoConnector} data - SSO connector data schema
 * @method {getConfig} getConfig - Get the full-list of SSO config from the SSO provider
 */
export abstract class SingleSignOn {
  abstract data: SingleSignOnConnectorData;
  abstract getConfig: () => Promise<JsonObject>;
  abstract getIssuer: () => Promise<string>;
}
