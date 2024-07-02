import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Go',
  description:
    'Go is an efficient, concurrent, statically typed programming language for web applications ',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'go',
    path: 'gin-sample',
  },
  fullGuide: 'go',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/go/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/go/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
