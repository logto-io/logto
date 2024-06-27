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
});

export default metadata;
