import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Ruby',
  description:
    'Ruby is a dynamic, open-source programming language with a focus on simplicity and productivity.',
  target: ApplicationType.Traditional,
  isFeatured: true,
  sample: {
    repo: 'ruby',
    path: 'logto-sample',
  },
  fullGuide: 'ruby',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/ruby/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/ruby/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
