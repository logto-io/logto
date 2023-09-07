// This is a generated file, don't update manually.

import { lazy } from 'react';

import m2mGeneral from './m2m-general/index';
import nativeAndroidJava from './native-android-java/index';
import nativeAndroidKt from './native-android-kt/index';
import nativeCapacitor from './native-capacitor/index';
import nativeFlutter from './native-flutter/index';
import nativeIosSwift from './native-ios-swift/index';
import spaReact from './spa-react/index';
import spaVanilla from './spa-vanilla/index';
import spaVue from './spa-vue/index';
import { type Guide } from './types';
import webAspNetCore from './web-asp-net-core/index';
import webExpress from './web-express/index';
import webGo from './web-go/index';
import webGptPlugin from './web-gpt-plugin/index';
import webNext from './web-next/index';
import webNextAppRouter from './web-next-app-router/index';
import webOutline from './web-outline/index';
import webPhp from './web-php/index';
import webPython from './web-python/index';
import webRemix from './web-remix/index';

const guides: Readonly<Guide[]> = Object.freeze([
  {
    order: 1,
    id: 'web-next',
    Logo: lazy(async () => import('./web-next/logo.svg')),
    Component: lazy(async () => import('./web-next/README.mdx')),
    metadata: webNext,
  },
  {
    order: 1.1,
    id: 'spa-react',
    Logo: lazy(async () => import('./spa-react/logo.svg')),
    Component: lazy(async () => import('./spa-react/README.mdx')),
    metadata: spaReact,
  },
  {
    order: 1.1,
    id: 'web-next-app-router',
    Logo: lazy(async () => import('./web-next-app-router/logo.svg')),
    Component: lazy(async () => import('./web-next-app-router/README.mdx')),
    metadata: webNextAppRouter,
  },
  {
    order: 1.2,
    id: 'm2m-general',
    Logo: lazy(async () => import('./m2m-general/logo.svg')),
    Component: lazy(async () => import('./m2m-general/README.mdx')),
    metadata: m2mGeneral,
  },
  {
    order: 1.2,
    id: 'web-express',
    Logo: lazy(async () => import('./web-express/logo.svg')),
    Component: lazy(async () => import('./web-express/README.mdx')),
    metadata: webExpress,
  },
  {
    order: 1.3,
    id: 'web-go',
    Logo: lazy(async () => import('./web-go/logo.svg')),
    Component: lazy(async () => import('./web-go/README.mdx')),
    metadata: webGo,
  },
  {
    order: 1.5,
    id: 'web-gpt-plugin',
    Logo: lazy(async () => import('./web-gpt-plugin/logo.svg')),
    Component: lazy(async () => import('./web-gpt-plugin/README.mdx')),
    metadata: webGptPlugin,
  },
  {
    order: 1.6,
    id: 'spa-vue',
    Logo: lazy(async () => import('./spa-vue/logo.svg')),
    Component: lazy(async () => import('./spa-vue/README.mdx')),
    metadata: spaVue,
  },
  {
    order: 1.7,
    id: 'native-ios-swift',
    Logo: lazy(async () => import('./native-ios-swift/logo.svg')),
    Component: lazy(async () => import('./native-ios-swift/README.mdx')),
    metadata: nativeIosSwift,
  },
  {
    order: 2,
    id: 'native-android-kt',
    Logo: lazy(async () => import('./native-android-kt/logo.svg')),
    Component: lazy(async () => import('./native-android-kt/README.mdx')),
    metadata: nativeAndroidKt,
  },
  {
    order: 2,
    id: 'spa-vanilla',
    Logo: lazy(async () => import('./spa-vanilla/logo.svg')),
    Component: lazy(async () => import('./spa-vanilla/README.mdx')),
    metadata: spaVanilla,
  },
  {
    order: 2,
    id: 'web-php',
    Logo: lazy(async () => import('./web-php/logo.svg')),
    Component: lazy(async () => import('./web-php/README.mdx')),
    metadata: webPhp,
  },
  {
    order: 3,
    id: 'native-android-java',
    Logo: lazy(async () => import('./native-android-java/logo.svg')),
    Component: lazy(async () => import('./native-android-java/README.mdx')),
    metadata: nativeAndroidJava,
  },
  {
    order: 3,
    id: 'web-python',
    Logo: lazy(async () => import('./web-python/logo.svg')),
    Component: lazy(async () => import('./web-python/README.mdx')),
    metadata: webPython,
  },
  {
    order: 4,
    id: 'native-capacitor',
    Logo: lazy(async () => import('./native-capacitor/logo.svg')),
    Component: lazy(async () => import('./native-capacitor/README.mdx')),
    metadata: nativeCapacitor,
  },
  {
    order: 4,
    id: 'web-remix',
    Logo: lazy(async () => import('./web-remix/logo.svg')),
    Component: lazy(async () => import('./web-remix/README.mdx')),
    metadata: webRemix,
  },
  {
    order: 5,
    id: 'native-flutter',
    Logo: lazy(async () => import('./native-flutter/logo.svg')),
    Component: lazy(async () => import('./native-flutter/README.mdx')),
    metadata: nativeFlutter,
  },
  {
    order: 5,
    id: 'web-asp-net-core',
    Logo: lazy(async () => import('./web-asp-net-core/logo.svg')),
    Component: lazy(async () => import('./web-asp-net-core/README.mdx')),
    metadata: webAspNetCore,
  },
  {
    order: 6,
    id: 'web-outline',
    Logo: lazy(async () => import('./web-outline/logo.svg')),
    Component: lazy(async () => import('./web-outline/README.mdx')),
    metadata: webOutline,
  },
]);

export default guides;
