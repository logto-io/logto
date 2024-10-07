import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Protected app',
  description: 'Non-SDK integration solution powered by Cloudflare Workers',
  target: ApplicationType.Protected,
  isFeatured: true,
  isCloud: true,
  skipGuideAfterCreation: true,
});

export default metadata;
