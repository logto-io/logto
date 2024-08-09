import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'SvelteKit',
  description:
    'SvelteKit is a framework for rapidly developing robust, performant web applications using Svelte.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'js',
    path: 'packages/sveltekit-sample',
  },
  fullGuide: 'sveltekit',
  furtherReadings: [
    {
      title: 'Get user information',
      url: new URL('https://docs.logto.io/quick-starts/sveltekit/#get-user-information'),
    },
    {
      title: 'API resources and organizations',
      url: new URL('https://docs.logto.io/quick-starts/sveltekit/#api-resources-and-organizations'),
    },
  ],
});

export default metadata;
