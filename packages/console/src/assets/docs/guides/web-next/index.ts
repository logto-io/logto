import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js (Page Router)',
  description:
    'Next.js is a React framework for production - it makes building fullstack React apps a breeze and ships with built-in SSR.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-sample',
  },
  fullGuide: 'next',
});

export default metadata;
