import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'ChatGPT plugin',
  description: 'Integrate ChatGPT Plugin OAuth with Logto.',
  target: ApplicationType.Traditional,
  isFeatured: true,
});

export default metadata;
