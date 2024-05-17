import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next Auth',
  description: 'Authentication for Next.js.',
  target: ApplicationType.Traditional,
});

export default metadata;
