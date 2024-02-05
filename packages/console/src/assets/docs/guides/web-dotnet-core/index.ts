import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: '.NET Core (Razor Pages)',
  description: 'Integrate Logto into your .NET Core web app with Razor Pages and view models.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'csharp',
    path: '/',
  },
});

export default metadata;
