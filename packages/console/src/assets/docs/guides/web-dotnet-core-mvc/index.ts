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
  fullGuide: {
    title: 'Full .NET Core (MVC) integration tutorial',
    url: 'https://docs.logto.io/quick-starts/dotnet-core/mvc',
  },
});

export default metadata;
