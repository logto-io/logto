import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Vanilla JS',
  description: 'The framework-agnostic JavaScript integration.',
  target: ApplicationType.SPA,
  sample: {
    repo: 'js',
    path: 'packages/browser-sample',
  },
  fullGuide: 'vanilla-js',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/vanilla-js/#get-user-information'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/vanilla-js/#api-resources'),
    },
  ],
});

export default metadata;
