import { ApplicationType } from '@logto/schemas';

export const applicationTypeI18nKey = Object.freeze({
  [ApplicationType.Native]: 'applications.type.native',
  [ApplicationType.SPA]: 'applications.type.spa',
  [ApplicationType.Traditional]: 'applications.type.traditional',
} as const);

export enum SupportedSdk {
  iOS = 'iOS',
  Android = 'Android',
  React = 'React',
  Vue = 'Vue',
  Vanilla = 'Vanilla',
  Express = 'Express',
}

export const applicationTypeAndSdkTypeMappings = Object.freeze({
  [ApplicationType.Native]: [SupportedSdk.iOS, SupportedSdk.Android],
  [ApplicationType.SPA]: [SupportedSdk.React, SupportedSdk.Vue, SupportedSdk.Vanilla],
  [ApplicationType.Traditional]: [SupportedSdk.Express],
} as const);
