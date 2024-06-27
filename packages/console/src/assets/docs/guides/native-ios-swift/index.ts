import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'iOS (Swift)',
  description: 'iOS (Swift) application integration guide.',
  target: ApplicationType.Native,
  sample: {
    repo: 'swift',
    path: 'Demos/SwiftUI%20Demo',
  },
  fullGuide: 'swift',
});

export default metadata;
