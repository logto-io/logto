import { ApplicationType } from '@logto/schemas';

export const applicationTypeI18nKey = Object.freeze({
  [ApplicationType.Native]: 'applications.type.native',
  [ApplicationType.SPA]: 'applications.type.spa',
  [ApplicationType.Traditional]: 'applications.type.traditional',
} as const);

export enum SupportedSdk {
  iOS = 'iOS',
  Android = 'Android',
  Angular = 'Angular',
  React = 'React',
  Vue = 'Vue',
  Traditional = 'Traditional',
}

export const applicationTypeAndSdkTypeMappings = Object.freeze({
  [ApplicationType.Native]: [SupportedSdk.iOS, SupportedSdk.Android],
  [ApplicationType.SPA]: [SupportedSdk.Angular, SupportedSdk.React, SupportedSdk.Vue],
  [ApplicationType.Traditional]: [SupportedSdk.Traditional],
} as const);
