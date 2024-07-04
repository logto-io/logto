import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Chrome extension',
  description: 'Build a Chrome extension with Logto.',
  target: ApplicationType.SPA,
  sample: {
    repo: 'js',
    path: 'packages/chrome-extension-sample',
  },
  fullGuide: 'chrome-extension',
});

export default metadata;
