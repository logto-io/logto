import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js (App Router)',
  description:
    "Next.js is a full stack React SSR framework for production, the App Router is a new paradigm for building applications using React's latest features.",
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-app-dir-sample',
  },
});

export default metadata;
