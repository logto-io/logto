import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Java Web',
  description:
    'Java Web is a web framework for Java that enables developers to build secure, fast, and scalable server applications with the Java programming language.',
  target: ApplicationType.Traditional,
});

export default metadata;
