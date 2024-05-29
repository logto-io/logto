import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Next.js (App Router)',
  description: 'Next.js integration guide for App Router.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/next-server-actions-sample',
  },
  isFeatured: true,
  fullGuide: {
    title: 'Full Next.js SDK tutorial',
    url: 'https://docs.logto.io/sdk/next-app-router/',
  },
});

export default metadata;
