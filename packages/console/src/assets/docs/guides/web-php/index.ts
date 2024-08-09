import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'PHP',
  description: 'Integrate Logto into your PHP web app, such as Laravel.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'php',
    path: 'samples',
  },
  fullGuide: 'php',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/php/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/php/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
