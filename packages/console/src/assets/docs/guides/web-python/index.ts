import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Python',
  description: 'Integrate Logto into your Python web app, such as Django and Flask.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'python',
    path: 'samples',
  },
  fullGuide: 'python',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/python/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/python/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
