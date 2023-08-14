// This is a generated file, don't update manually.

import { lazy } from 'react';

import spaReact from './spa-react/index';
import { type Guide } from './types';

const guides: Readonly<Guide[]> = Object.freeze([
  {
    id: 'spa-react',
    Logo: lazy(async () => import('./spa-react/logo.svg')),
    Component: lazy(async () => import('./spa-react/README.mdx')),
    metadata: spaReact,
  },
]);

export default guides;
