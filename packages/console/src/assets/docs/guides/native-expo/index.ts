import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Expo (React Native)',
  description: 'Create universal native apps with React that run on Android, iOS, and the web.',
  target: ApplicationType.Native,
  sample: {
    repo: 'react-native',
    path: 'packages/rn-sample',
  },
  fullGuide: 'expo',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/expo/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/expo/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
