import { type ZodType } from 'zod';

export abstract class SingleSignOn {
  static providerName: SsoProviderName;
  static configGuard: ZodType;
  static logto: string;

  abstract getConfig: () => Promise<unknown>;
}

export enum SsoProviderName {
  OIDC = 'OIDC',
}
