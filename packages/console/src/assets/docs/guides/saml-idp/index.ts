import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata = Object.freeze({
  name: 'SAML',
  description: 'Use Logto as a SAML identity provider (IdP) for your application.',
  target: ApplicationType.SAML,
  isThirdParty: false,
  skipGuideAfterCreation: true,
} satisfies GuideMetadata);

export default metadata;
