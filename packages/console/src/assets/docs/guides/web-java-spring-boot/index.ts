import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Java Spring Boot',
  description:
    'Spring Boot is a web framework for Java that enables developers to build secure, fast, and scalable server applications with the Java programming language.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'spring-boot-sample',
    path: '',
  },
  isFeatured: true,
});

export default metadata;
