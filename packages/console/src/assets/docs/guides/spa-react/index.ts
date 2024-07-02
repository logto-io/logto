import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'React',
  description: 'React is a JavaScript library for building user interfaces.',
  target: ApplicationType.SPA,
  sample: {
    repo: 'js',
    path: 'packages/react-sample',
  },
  isFeatured: true,
  fullGuide: 'react',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/react/#get-user-information'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/react/#api-resources'),
    },
  ],
});

export default metadata;
