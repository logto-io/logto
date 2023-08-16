import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Outline',
  description: 'Use Logto as an identity provider for Outline',
  target: ApplicationType.Traditional,
});

export default metadata;
