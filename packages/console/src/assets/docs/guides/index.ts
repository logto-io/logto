// This is a generated file, don't update manually.

import { lazy } from 'react';

import spaReact from './spa-react/index';
import { type Guide } from './types';
import webExpress from './web-express/index';

const guides: Readonly<Guide[]> = Object.freeze([
  {
    id: 'spa-react',
    Logo: lazy(async () => import('./spa-react/logo.svg')),
    Component: lazy(async () => import('./spa-react/README.mdx')),
    metadata: spaReact,
  },

  {
    id: 'web-express',
    Logo: lazy(async () => import('./web-express/logo.svg')),
    Component: lazy(async () => import('./web-express/README.mdx')),
    metadata: webExpress,
  },
]);

export default guides;
