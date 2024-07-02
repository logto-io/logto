import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: '.NET Core (Blazor Server)',
  description: 'Integrate Logto into your .NET Core Blazor Server app.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'csharp',
    path: '/',
  },
  fullGuide: 'dotnet-core/blazor-server',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/dotnet-core/blazor-server/#the-user-object'),
    },
    {
      title: 'API resources',
      url: new URL('https://docs.logto.io/quick-starts/dotnet-core/blazor-server/#api-resources'),
    },
  ],
});

export default metadata;
