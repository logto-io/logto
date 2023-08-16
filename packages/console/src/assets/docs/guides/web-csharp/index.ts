import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'C#',
  description:
    'C# is a general-purpose, object-oriented programming language developed by Microsoft.',
  target: ApplicationType.Traditional,
});

export default metadata;
