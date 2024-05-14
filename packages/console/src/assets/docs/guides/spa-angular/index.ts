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
  fullGuide: {
    title: 'Full Angular guide',
    url: 'https://docs.logto.io/quick-starts/angular',
  },
});

export default metadata;
