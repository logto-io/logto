import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'ASP.NET Core (MVC)',
  description: 'ASP.NET Core is a cross-platform framework for building modern apps.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'csharp',
    path: 'sample-mvc',
  },
});

export default metadata;
