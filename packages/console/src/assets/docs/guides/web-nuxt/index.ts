import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Nuxt',
  description:
    'Nuxt is an open source framework that makes web development intuitive and powerful.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/nuxt',
  },
  fullGuide: 'nuxt',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/nuxt/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/nuxt/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
