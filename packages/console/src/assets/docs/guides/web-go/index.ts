import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Go',
  description:
    'Go is an open source programming language that makes it easy to build simple, reliable, and efficient software.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'go',
    path: 'gin-sample',
  },
});

export default metadata;
