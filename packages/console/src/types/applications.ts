import { ApplicationType } from '@logto/schemas';

export const applicationTypeI18nKey = Object.freeze({
  [ApplicationType.Native]: 'applications.type.native',
  [ApplicationType.SPA]: 'applications.type.spa',
  [ApplicationType.Traditional]: 'applications.type.traditional',
  [ApplicationType.MachineToMachine]: 'applications.type.machine_to_machine',
} as const);

export enum SupportedSdk {
  iOS = 'iOS',
  Android = 'Android',
  React = 'React',
  Vue = 'Vue',
  Vanilla = 'Vanilla',
  Express = 'Express',
  Next = 'Next',
  Go = 'Go',
}

export const applicationTypeAndSdkTypeMappings = Object.freeze({
  [ApplicationType.Native]: [SupportedSdk.iOS, SupportedSdk.Android],
  [ApplicationType.SPA]: [SupportedSdk.React, SupportedSdk.Vue, SupportedSdk.Vanilla],
  [ApplicationType.Traditional]: [SupportedSdk.Next, SupportedSdk.Express, SupportedSdk.Go],
  [ApplicationType.MachineToMachine]: [],
} as const);
