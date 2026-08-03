import { ApplicationType, type Application } from '@logto/schemas';

import { type Guide } from '@/assets/docs/guides/types';

export const thirdPartyAppCategory = 'ThirdParty';

/**
 * The guide id of the dynamic app (CIMD) card. Selecting it enables the tenant-level feature
 * instead of creating an application.
 */
export const dynamicAppGuideId = 'third-party-dynamic-app';

/**
 * Stands in for an application id in the list row and in the details page path. Application ids are
 * generated, so it can never collide with a real one.
 */
export const dynamicAppId = 'dynamic-app';

/**
 * The dynamic app is listed among third-party applications once enabled, but it is a tenant-level
 * feature switch: it has no application record, hence no client id.
 */
export type DynamicAppRow = { id: typeof dynamicAppId };

export const dynamicAppRow: DynamicAppRow = { id: dynamicAppId };

export const isDynamicAppRow = (row: { id: string }): row is DynamicAppRow =>
  row.id === dynamicAppId;

export type ApplicationListRow = Application | DynamicAppRow;

export const applicationTypeI18nKey = Object.freeze({
  [ApplicationType.Native]: 'applications.type.native',
  [ApplicationType.SPA]: 'applications.type.spa',
  [ApplicationType.Traditional]: 'applications.type.traditional',
  [ApplicationType.MachineToMachine]: 'applications.type.machine_to_machine',
  [ApplicationType.Protected]: 'applications.type.protected',
  [ApplicationType.SAML]: 'applications.type.saml',
  thirdParty: 'applications.type.third_party',
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
  'Protected',
  'MachineToMachine',
  'SAML',
  thirdPartyAppCategory,
] as const);

export type AppGuideCategory = (typeof allAppGuideCategories)[number];

/**
 * Structured application guide metadata, grouped by the above application category.
 * E.g. `{'featured': [...], 'Traditional': [...], 'SPA': [...], 'Native': [...]}`
 */
export type StructuredAppGuideMetadata = Record<AppGuideCategory, readonly Guide[]>;
