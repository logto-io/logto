import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js (App Router)',
  description: 'Next.js integration guide for App Router.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-server-actions-sample',
  },
  isFeatured: true,
  fullGuide: 'next-app-router',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/next-app-router/#get-user-information'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/next-app-router/#api-resources'),
    },
  ],
});

export default metadata;
