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
});

export default metadata;
