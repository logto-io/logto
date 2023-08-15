import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Remix',
  description: 'Integrate your Remix application with Logto.',
  target: ApplicationType.SPA,
});

export default metadata;
