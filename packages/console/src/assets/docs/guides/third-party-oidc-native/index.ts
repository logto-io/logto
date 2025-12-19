import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Third-party app (Native app)',
  description: 'An app that runs in a native environment.',
  target: ApplicationType.Native,
  isThirdParty: true,
  skipGuideAfterCreation: true,
});

export default metadata;
