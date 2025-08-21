import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'OIDC',
  description: 'Use Logto as a third-party OAuth / OIDC identity provider to offer user consent.',
  target: ApplicationType.Traditional,
  isThirdParty: true,
  skipGuideAfterCreation: true,
});

export default metadata;
