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
});

export default metadata;
