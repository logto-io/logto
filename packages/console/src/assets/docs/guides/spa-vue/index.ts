import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Vue',
  description:
    'Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.',
  target: ApplicationType.SPA,
  sample: {
    repo: 'js',
    path: 'packages/vue-sample',
  },
  isFeatured: true,
  fullGuide: 'vue',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/vue/#get-user-information'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/vue/#api-resources'),
    },
  ],
});

export default metadata;
