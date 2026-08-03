import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

/**
 * Dynamic apps are not application entities: the card is a tenant-level switch for CIMD
 * (OAuth Client ID Metadata Documents), so it never opens the application creation form.
 */
const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Dynamic app',
  description:
    'Allow compatible public clients to connect without registration. Using CIMD specification.',
  target: ApplicationType.Traditional,
  isThirdParty: true,
  isDevFeature: true,
});

export default metadata;
