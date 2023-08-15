import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Python',
  description:
    'Python is a programming language that lets you work quickly and integrate systems more effectively.',
  target: ApplicationType.Traditional,
});

export default metadata;
