import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata = Object.freeze({
  name: 'SAML',
  description: 'XML-based framework for SSO. Use if apps only support SAML.',
  target: ApplicationType.SAML,
  isThirdParty: false,
  skipGuideAfterCreation: true,
} satisfies GuideMetadata);

export default metadata;
