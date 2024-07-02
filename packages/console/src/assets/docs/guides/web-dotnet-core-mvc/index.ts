import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: '.NET Core (MVC)',
  description: 'Integrate Logto into your .NET Core web app with Model-View-Controller (MVC).',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'csharp',
    path: '/',
  },
  fullGuide: 'dotnet-core/mvc',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/dotnet-core/mvc/#the-user-object'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/dotnet-core/mvc/#api-resources'),
    },
  ],
});

export default metadata;
