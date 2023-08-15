import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Android (Kotlin)',
  description: 'Android integration for Kotlin.',
  target: ApplicationType.Native,
  sample: {
    repo: 'kotlin',
    path: 'android-sample-kotlin',
  },
});

export default metadata;
