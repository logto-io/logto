import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'React Router',
  description:
    'React Router is a multi-strategy router for React. Use it as a framework or library, on the web or server.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/react-router-sample',
  },
  fullGuide: 'react-router',
});

export default metadata;
