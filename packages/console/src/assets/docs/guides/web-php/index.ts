import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'PHP',
  description: 'Integrate Logto into your PHP web app, such as Lavarel.',
  target: ApplicationType.Traditional,
  fullTutorial: {
    title: 'Full PHP SDK tutorial',
    url: 'https://docs.logto.io/sdk/php',
  },
});

export default metadata;
