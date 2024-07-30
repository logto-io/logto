import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Passport',
  description: 'Passport is authentication middleware for Node.js.',
  target: ApplicationType.Traditional,
});

export default metadata;
