import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Third-party app (Single page app)',
  description: 'An app that runs in a web browser and dynamically updates data in place.',
  target: ApplicationType.SPA,
  isThirdParty: true,
  skipGuideAfterCreation: true,
});

export default metadata;
