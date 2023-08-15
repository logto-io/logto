import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'PHP',
  description: 'PHP is the best language in the world.',
  target: ApplicationType.Traditional,
});

export default metadata;
