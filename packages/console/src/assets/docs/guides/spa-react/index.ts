import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'React',
  description: 'React is a JavaScript library for building user interfaces.',
  target: ApplicationType.SPA,
  language: 'javascript',
});

export default metadata;
