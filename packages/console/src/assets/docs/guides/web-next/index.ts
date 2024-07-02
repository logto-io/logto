import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js',
  description:
    'Next.js is a React framework for production - it makes building fullstack React apps a breeze and ships with built-in SSR.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-sample',
  },
  fullGuide: 'next',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/next/#get-user-information'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/next/#api-resources'),
    },
  ],
});

export default metadata;
