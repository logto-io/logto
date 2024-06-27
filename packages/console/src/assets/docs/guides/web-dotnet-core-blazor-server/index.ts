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
});

export default metadata;
