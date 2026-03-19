import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Input-limited app / CLI',
  description:
    'Use OAuth device flow for input-limited devices or headless apps (e.g., TVs, Game console, CLI)',
  target: ApplicationType.Native,
  fullGuide: 'device-flow',
  isDevFeature: true,
});

export default metadata;
