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
  fullGuide: {
    title: 'Full React SDK tutorial',
    url: 'https://docs.logto.io/quick-starts/react',
  },
});

export default metadata;
