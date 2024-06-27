import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Go',
  description:
    'Go is an efficient, concurrent, statically typed programming language for web applications ',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'go',
    path: 'gin-sample',
  },
  fullGuide: 'go',
});

export default metadata;
