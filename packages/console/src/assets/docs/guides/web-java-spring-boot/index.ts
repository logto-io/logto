import { ApplicationType } from '@logto/schemas';

import { type GuideMetadata } from '../types';

const metadata: Readonly<GuideMetadata> = Object.freeze({
  name: 'Java Spring Boot Web',
  description: 'Integrate Logto with a Java Spring Boot web application.',
  target: ApplicationType.Traditional,
  sample: {
    repo: 'spring-boot-sample',
    path: '',
  },
});

export default metadata;
