import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js (App Router)',
  description:
    'Next.js (App Router) is a React framework for production - it makes building fullstack React apps and sites a breeze and ships with built-in SSR.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-sample',
  },
});

export default metadata;
