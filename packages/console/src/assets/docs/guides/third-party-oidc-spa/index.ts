import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Third-party app (Single page app)',
  description: 'An app that runs in a web browser and dynamically updates data in place.',
  target: ApplicationType.SPA,
  isThirdParty: true,
  skipGuideAfterCreation: true,
  // TODO: @xiaoyijun Remove isDevFeature when third-party SPA and Native apps are ready for production
  isDevFeature: true,
});

export default metadata;
