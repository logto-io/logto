import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Third-party app (Traditional web)',
  description: 'An app that renders and updates pages by the web server alone.',
  target: ApplicationType.Traditional,
  isThirdParty: true,
  skipGuideAfterCreation: true,
});

export default metadata;
