import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Flutter',
  description: 'Flutter is a framework for building hybrid mobile apps.',
  target: ApplicationType.Native,
});

export default metadata;
