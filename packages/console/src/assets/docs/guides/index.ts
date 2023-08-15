// This is a generated file, don't update manually.

import { lazy } from 'react';

import nativeAndroidJava from './native-android-java/index';
import nativeAndroidKt from './native-android-kt/index';
import nativeIosSwift from './native-ios-swift/index';
import spaReact from './spa-react/index';
import spaVanilla from './spa-vanilla/index';
import spaVue from './spa-vue/index';
import { type Guide } from './types';
import webExpress from './web-express/index';
import webGo from './web-go/index';
import webNext from './web-next/index';

const guides: Readonly<Guide[]> = Object.freeze([
  {
    id: 'native-android-java',
    Logo: lazy(async () => import('./native-android-java/logo.svg')),
    Component: lazy(async () => import('./native-android-java/README.mdx')),
    metadata: nativeAndroidJava,
  },

  {
    id: 'native-android-kt',
    Logo: lazy(async () => import('./native-android-kt/logo.svg')),
    Component: lazy(async () => import('./native-android-kt/README.mdx')),
    metadata: nativeAndroidKt,
  },

  {
    id: 'native-ios-swift',
    Logo: lazy(async () => import('./native-ios-swift/logo.svg')),
    Component: lazy(async () => import('./native-ios-swift/README.mdx')),
    metadata: nativeIosSwift,
  },

  {
    id: 'spa-react',
    Logo: lazy(async () => import('./spa-react/logo.svg')),
    Component: lazy(async () => import('./spa-react/README.mdx')),
    metadata: spaReact,
  },

  {
    id: 'spa-vanilla',
    Logo: lazy(async () => import('./spa-vanilla/logo.svg')),
    Component: lazy(async () => import('./spa-vanilla/README.mdx')),
    metadata: spaVanilla,
  },

  {
    id: 'spa-vue',
    Logo: lazy(async () => import('./spa-vue/logo.svg')),
    Component: lazy(async () => import('./spa-vue/README.mdx')),
    metadata: spaVue,
  },

  {
    id: 'web-express',
    Logo: lazy(async () => import('./web-express/logo.svg')),
    Component: lazy(async () => import('./web-express/README.mdx')),
    metadata: webExpress,
  },

  {
    id: 'web-go',
    Logo: lazy(async () => import('./web-go/logo.svg')),
    Component: lazy(async () => import('./web-go/README.mdx')),
    metadata: webGo,
  },

  {
    id: 'web-next',
    Logo: lazy(async () => import('./web-next/logo.svg')),
    Component: lazy(async () => import('./web-next/README.mdx')),
    metadata: webNext,
  },
]);

export default guides;
