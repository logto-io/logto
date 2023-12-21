import { ApplicationType } from '@logto/schemas';

import { type Guide } from '@/assets/docs/guides/types';

export const thirdPartyAppCategory = 'ThirdParty' as const;

export const applicationTypeI18nKey = Object.freeze({
  [ApplicationType.Native]: 'applications.type.native',
  [ApplicationType.SPA]: 'applications.type.spa',
  [ApplicationType.Traditional]: 'applications.type.traditional',
  [ApplicationType.MachineToMachine]: 'applications.type.machine_to_machine',
  // TODO @sijie: update with new phrase
  [ApplicationType.Protected]: 'applications.type.traditional',
} as const);

/**
 * All application guide categories, including all 4 existing application types,
 * plus the "featured" category.
 */
export const allAppGuideCategories = Object.freeze([
  'featured',
  'Traditional',
  'SPA',
  'Native',
  'MachineToMachine',
  'Protected',
  thirdPartyAppCategory,
] as const);

export type AppGuideCategory = (typeof allAppGuideCategories)[number];

/**
 * Structured application guide metadata, grouped by the above application category.
 * E.g. `{'featured': [...], 'Traditional': [...], 'SPA': [...], 'Native': [...]}`
 */
export type StructuredAppGuideMetadata = Record<AppGuideCategory, readonly Guide[]>;
