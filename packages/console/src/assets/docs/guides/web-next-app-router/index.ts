import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js (App Router)',
  description:
    "Next.js App Router is a new paradigm for building applications using React's latest features.",
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-app-dir-sample',
  },
  fullGuide: {
    title: 'Full Next.js App Router SDK tutorial',
    url: 'https://docs.logto.io/quick-starts/next-app-router',
  },
});

export default metadata;
