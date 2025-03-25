import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'WordPress plugin',
  description: 'Use official WordPress plugin to integrate Logto into your WordPress website.',
  target: ApplicationType.Traditional,
  fullGuide: 'wordpress-plugin',
});

export default metadata;
