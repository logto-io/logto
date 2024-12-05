import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata = Object.freeze({
  name: 'SAML',
  description: 'Use Logto as a SAML identity provider (IdP) for your application.',
  target: ApplicationType.SAML,
  isThirdParty: true,
  skipGuideAfterCreation: true,
  isCloud: true,
  isDevFeature: true,
} satisfies GuideMetadata);

export default metadata;
