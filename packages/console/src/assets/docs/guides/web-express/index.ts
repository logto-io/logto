import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Express',
  description:
    'Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/express-sample',
  },
  fullGuide: {
    title: 'Full Express SDK tutorial',
    url: 'https://docs.logto.io/quick-starts/express',
  },
});

export default metadata;
