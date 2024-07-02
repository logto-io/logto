import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Angular',
  description: 'Angular is a JavaScript library for building user interfaces.',
  target: ApplicationType.SPA,
  sample: {
    repo: 'js',
    path: 'packages/angular-sample',
  },
  fullGuide: 'angular',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/angular/#get-user-information'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/angular/#api-resources'),
    },
  ],
});

export default metadata;
