import { type SsoConnector } from '@logto/schemas';

export abstract class SingleSignOn {
  abstract data: SsoConnector;
  abstract getConfig: () => Promise<unknown>;
}

export enum SsoProviderName {
  OIDC = 'OIDC',
}
