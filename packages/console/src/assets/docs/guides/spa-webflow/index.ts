import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Webflow',
  description: 'Webflow is a SaaS platform for website building and hosting.',
  target: ApplicationType.SPA,
});

export default metadata;
