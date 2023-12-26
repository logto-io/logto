import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js (Server Actions)',
  description:
    'Next.js with Server Actions, leverages async component from the latest features of React.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-server-actions-sample',
  },
});

export default metadata;
