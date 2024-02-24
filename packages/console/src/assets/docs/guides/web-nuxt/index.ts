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
  fullGuide: {
    title: 'Full Nuxt guide',
    url: 'https://docs.logto.io/sdk/nuxt',
  },
});

export default metadata;
