import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'ASP.NET Core',
  description:
    'ASP.NET Core is a cross-platform and open-source framework for building modern applications.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'csharp',
    path: 'sample',
  },
});

export default metadata;
