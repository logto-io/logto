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
  fullGuide: 'express',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/express/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/express/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
