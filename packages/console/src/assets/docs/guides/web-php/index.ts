import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'PHP',
  description: 'Integrate Logto into your PHP web app, such as Lavarel.',
  target: ApplicationType.Traditional,
});

export default metadata;
