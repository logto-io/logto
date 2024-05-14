import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'PHP',
  description: 'Integrate Logto into your PHP web app, such as Lavarel.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'php',
    path: 'samples',
  },
  fullGuide: {
    title: 'Full PHP SDK tutorial',
    url: 'https://docs.logto.io/quick-starts/php',
  },
});

export default metadata;
