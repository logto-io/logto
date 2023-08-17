import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Remix',
  description:
    'Remix is a modern SSR full stack web framework that lets you focus on the user interface and work back through web standards.',
  target: ApplicationType.Traditional,
});

export default metadata;
