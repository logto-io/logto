import { ApplicationType } from '@logto/schemas';

import { isCloud } from '@/consts/env';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Ruby',
  description:
    'Ruby is a dynamic, open-source programming language with a focus on simplicity and productivity.',
  target: ApplicationType.Traditional,
  isFeatured: !isCloud,
  sample: {
    repo: 'ruby',
    path: 'logto-sample',
  },
  fullGuide: 'ruby',
});

export default metadata;
