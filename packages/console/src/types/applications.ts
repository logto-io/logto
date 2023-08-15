import { ApplicationType } from '@logto/schemas';

import { type Guide } from '@/assets/docs/guides/types';

/** @deprecated */
export const applicationTypeI18nKey = Object.freeze({
  [ApplicationType.Native]: 'applications.type.native',
  [ApplicationType.SPA]: 'applications.type.spa',
  [ApplicationType.Traditional]: 'applications.type.traditional',
  [ApplicationType.MachineToMachine]: 'applications.type.machine_to_machine',
} as const);

/** @deprecated */
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

/** @deprecated */
export const applicationTypeAndSdkTypeMappings = Object.freeze({
  [ApplicationType.Native]: [SupportedSdk.iOS, SupportedSdk.Android],
  [ApplicationType.SPA]: [SupportedSdk.React, SupportedSdk.Vue, SupportedSdk.Vanilla],
  [ApplicationType.Traditional]: [SupportedSdk.Next, SupportedSdk.Express, SupportedSdk.Go],
  [ApplicationType.MachineToMachine]: [],
} as const);

/**
 * All application guide categories, including all 4 existing application types,
 * plus the "featured" category.
 */
/* eslint-disable import/no-unused-modules */
export const allAppGuideCategories = Object.freeze([
  'featured',
  'Traditional',
  'SPA',
  'Native',
  'MachineToMachine',
] as const);

export type AppGuideCategory = (typeof allAppGuideCategories)[number];

/**
 * Structured application guide metadata, grouped by the above application category.
 * E.g. `{'featured': [...], 'Traditional': [...], 'SPA': [...], 'Native': [...]}`
 */
export type StructuredAppGuideMetadata = Record<AppGuideCategory, readonly Guide[]>;
/* eslint-enable import/no-unused-modules */
