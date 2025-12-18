import { ApplicationType } from '@logto/schemas';

import { isDevFeaturesEnabled } from '@/consts/env';

import { type GuideMetadata } from '../types';

// TODO: @xiaoyijun Remove dev feature guard when third-party SPA and Native apps are ready for production
const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: isDevFeaturesEnabled ? 'Third-party app (Traditional web)' : 'OIDC',
  description: isDevFeaturesEnabled
    ? 'An app that renders and updates pages by the web server alone.'
    : 'Use Logto as a third-party OAuth / OIDC identity provider to offer user consent.',
  target: ApplicationType.Traditional,
  isThirdParty: true,
  skipGuideAfterCreation: true,
});

export default metadata;
