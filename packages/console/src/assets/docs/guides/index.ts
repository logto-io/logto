// This is a generated file, don't update manually.

import { lazy } from 'react';

import apiExpress from './api-express/index';
import apiPython from './api-python/index';
import apiSpringBoot from './api-spring-boot/index';
import m2mGeneral from './m2m-general/index';
import nativeAndroid from './native-android/index';
import nativeCapacitor from './native-capacitor/index';
import nativeExpo from './native-expo/index';
import nativeFlutter from './native-flutter/index';
import nativeIosSwift from './native-ios-swift/index';
import spaAngular from './spa-angular/index';
import spaReact from './spa-react/index';
import spaVanilla from './spa-vanilla/index';
import spaVue from './spa-vue/index';
import spaWebflow from './spa-webflow/index';
import thirdPartyOidc from './third-party-oidc/index';
import { type Guide } from './types';
import webDotnetCore from './web-dotnet-core/index';
import webDotnetCoreBlazorServer from './web-dotnet-core-blazor-server/index';
import webDotnetCoreBlazorWasm from './web-dotnet-core-blazor-wasm/index';
import webDotnetCoreMvc from './web-dotnet-core-mvc/index';
import webExpress from './web-express/index';
import webGo from './web-go/index';
import webGptPlugin from './web-gpt-plugin/index';
import webJavaSpringBoot from './web-java-spring-boot/index';
import webNext from './web-next/index';
import webNextAppRouter from './web-next-app-router/index';
import webNextServerActions from './web-next-server-actions/index';
import webNuxt from './web-nuxt/index';
import webOutline from './web-outline/index';
import webPhp from './web-php/index';
import webPython from './web-python/index';
import webRemix from './web-remix/index';
import webSveltekit from './web-sveltekit/index';

const guides: Readonly<Guide[]> = Object.freeze([
  {
    order: 1.1,
    id: 'native-expo',
    Logo: lazy(async () => import('./native-expo/logo.svg')),
    Component: lazy(async () => import('./native-expo/README.mdx')),
    metadata: nativeExpo,
  },
  {
    order: 1.1,
    id: 'spa-angular',
    Logo: lazy(async () => import('./spa-angular/logo.svg')),
    Component: lazy(async () => import('./spa-angular/README.mdx')),
    metadata: spaAngular,
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
    order: 1.1,
    id: 'web-next-server-actions',
    Logo: lazy(async () => import('./web-next-server-actions/logo.svg')),
    Component: lazy(async () => import('./web-next-server-actions/README.mdx')),
    metadata: webNextServerActions,
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
    order: 1.2,
    id: 'web-next',
    Logo: lazy(async () => import('./web-next/logo.svg')),
    Component: lazy(async () => import('./web-next/README.mdx')),
    metadata: webNext,
  },
  {
    order: 1.2,
    id: 'web-sveltekit',
    Logo: lazy(async () => import('./web-sveltekit/logo.svg')),
    Component: lazy(async () => import('./web-sveltekit/README.mdx')),
    metadata: webSveltekit,
  },
  {
    order: 1.3,
    id: 'web-go',
    Logo: lazy(async () => import('./web-go/logo.svg')),
    Component: lazy(async () => import('./web-go/README.mdx')),
    metadata: webGo,
  },
  {
    order: 1.4,
    id: 'web-java-spring-boot',
    Logo: lazy(async () => import('./web-java-spring-boot/logo.svg')),
    Component: lazy(async () => import('./web-java-spring-boot/README.mdx')),
    metadata: webJavaSpringBoot,
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
    id: 'native-android',
    Logo: lazy(async () => import('./native-android/logo.svg')),
    Component: lazy(async () => import('./native-android/README.mdx')),
    metadata: nativeAndroid,
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
    id: 'web-nuxt',
    Logo: lazy(async () => import('./web-nuxt/logo.svg')),
    Component: lazy(async () => import('./web-nuxt/README.mdx')),
    metadata: webNuxt,
  },
  {
    order: 2,
    id: 'web-php',
    Logo: lazy(async () => import('./web-php/logo.svg')),
    Component: lazy(async () => import('./web-php/README.mdx')),
    metadata: webPhp,
  },
  {
    order: 2.1,
    id: 'spa-webflow',
    Logo: lazy(async () => import('./spa-webflow/logo.svg')),
    Component: lazy(async () => import('./spa-webflow/README.mdx')),
    metadata: spaWebflow,
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
    id: 'web-dotnet-core',
    Logo: lazy(async () => import('./web-dotnet-core/logo.svg')),
    Component: lazy(async () => import('./web-dotnet-core/README.mdx')),
    metadata: webDotnetCore,
  },
  {
    order: 5.1,
    id: 'web-dotnet-core-mvc',
    Logo: lazy(async () => import('./web-dotnet-core-mvc/logo.svg')),
    Component: lazy(async () => import('./web-dotnet-core-mvc/README.mdx')),
    metadata: webDotnetCoreMvc,
  },
  {
    order: 5.2,
    id: 'web-dotnet-core-blazor-server',
    Logo: lazy(async () => import('./web-dotnet-core-blazor-server/logo.svg')),
    Component: lazy(async () => import('./web-dotnet-core-blazor-server/README.mdx')),
    metadata: webDotnetCoreBlazorServer,
  },
  {
    order: 5.3,
    id: 'web-dotnet-core-blazor-wasm',
    Logo: lazy(async () => import('./web-dotnet-core-blazor-wasm/logo.svg')),
    Component: lazy(async () => import('./web-dotnet-core-blazor-wasm/README.mdx')),
    metadata: webDotnetCoreBlazorWasm,
  },
  {
    order: 6,
    id: 'web-outline',
    Logo: lazy(async () => import('./web-outline/logo.svg')),
    Component: lazy(async () => import('./web-outline/README.mdx')),
    metadata: webOutline,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'api-express',
    Logo: lazy(async () => import('./api-express/logo.svg')),
    Component: lazy(async () => import('./api-express/README.mdx')),
    metadata: apiExpress,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'api-python',
    Logo: lazy(async () => import('./api-python/logo.svg')),
    Component: lazy(async () => import('./api-python/README.mdx')),
    metadata: apiPython,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'api-spring-boot',
    Logo: lazy(async () => import('./api-spring-boot/logo.svg')),
    Component: lazy(async () => import('./api-spring-boot/README.mdx')),
    metadata: apiSpringBoot,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'third-party-oidc',
    Logo: lazy(async () => import('./third-party-oidc/logo.svg')),
    Component: lazy(async () => import('./third-party-oidc/README.mdx')),
    metadata: thirdPartyOidc,
  },
]);

export default guides;
