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
  fullGuide: {
    title: 'Full vanilla JS SDK tutorial',
    url: 'https://docs.logto.io/quick-starts/vanilla-js',
  },
});

export default metadata;
