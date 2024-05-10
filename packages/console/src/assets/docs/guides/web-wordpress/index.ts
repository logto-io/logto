import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'WordPress',
  description: 'Integrate Logto into your WordPress app.',
  target: ApplicationType.Traditional,
  fullGuide: {
    title: 'Authorization and role mapping in WordPress',
    url: 'https://blog.logto.io/integrate-with-wordpress-authorization/',
  },
});

export default metadata;
