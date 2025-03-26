/* eslint-disable max-lines */
// This is a generated file, don't update manually.

import { safeLazy } from 'react-safe-lazy';

import apiExpress from './api-express/index';
import apiPython from './api-python/index';
import apiSpringBoot from './api-spring-boot/index';
import m2mGeneral from './m2m-general/index';
import nativeAndroid from './native-android/index';
import nativeCapacitor from './native-capacitor/index';
import nativeExpo from './native-expo/index';
import nativeFlutter from './native-flutter/index';
import nativeIosSwift from './native-ios-swift/index';
import protectedApp from './protected-app/index';
import samlIdp from './saml-idp/index';
import spaAngular from './spa-angular/index';
import spaChromeExtension from './spa-chrome-extension/index';
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
import webNextAuth from './web-next-auth/index';
import webNuxt from './web-nuxt/index';
import webOutline from './web-outline/index';
import webPassport from './web-passport/index';
import webPhp from './web-php/index';
import webPython from './web-python/index';
import webRuby from './web-ruby/index';
import webSveltekit from './web-sveltekit/index';
import webWordpress from './web-wordpress/index';
import webWordpressPlugin from './web-wordpress-plugin';

export const guides: Readonly<Guide[]> = Object.freeze([
  {
    order: 1,
    id: 'web-next-app-router',
    Logo: safeLazy(async () => import('./web-next-app-router/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./web-next-app-router/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./web-next-app-router/README.mdx')),
    metadata: webNextAppRouter,
  },
  {
    order: 1.1,
    id: 'native-expo',
    Logo: safeLazy(async () => import('./native-expo/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./native-expo/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./native-expo/README.mdx')),
    metadata: nativeExpo,
  },
  {
    order: 1.1,
    id: 'spa-angular',
    Logo: safeLazy(async () => import('./spa-angular/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./spa-angular/README.mdx')),
    metadata: spaAngular,
  },
  {
    order: 1.1,
    id: 'spa-chrome-extension',
    Logo: safeLazy(async () => import('./spa-chrome-extension/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./spa-chrome-extension/README.mdx')),
    metadata: spaChromeExtension,
  },
  {
    order: 1.1,
    id: 'spa-react',
    Logo: safeLazy(async () => import('./spa-react/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./spa-react/README.mdx')),
    metadata: spaReact,
  },
  {
    order: 1.2,
    id: 'web-express',
    Logo: safeLazy(async () => import('./web-express/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./web-express/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./web-express/README.mdx')),
    metadata: webExpress,
  },
  {
    order: 1.2,
    id: 'web-next',
    Logo: safeLazy(async () => import('./web-next/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./web-next/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./web-next/README.mdx')),
    metadata: webNext,
  },
  {
    order: 1.2,
    id: 'web-sveltekit',
    Logo: safeLazy(async () => import('./web-sveltekit/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-sveltekit/README.mdx')),
    metadata: webSveltekit,
  },
  {
    order: 1.3,
    id: 'spa-vue',
    Logo: safeLazy(async () => import('./spa-vue/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./spa-vue/README.mdx')),
    metadata: spaVue,
  },
  {
    order: 1.3,
    id: 'web-go',
    Logo: safeLazy(async () => import('./web-go/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-go/README.mdx')),
    metadata: webGo,
  },
  {
    order: 1.3,
    id: 'web-next-auth',
    Logo: safeLazy(async () => import('./web-next-auth/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-next-auth/README.mdx')),
    metadata: webNextAuth,
  },
  {
    order: 1.4,
    id: 'protected-app',
    Logo: safeLazy(async () => import('./protected-app/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./protected-app/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./protected-app/README.mdx')),
    metadata: protectedApp,
  },
  {
    order: 1.5,
    id: 'm2m-general',
    Logo: safeLazy(async () => import('./m2m-general/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./m2m-general/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./m2m-general/README.mdx')),
    metadata: m2mGeneral,
  },
  {
    order: 1.6,
    id: 'web-java-spring-boot',
    Logo: safeLazy(async () => import('./web-java-spring-boot/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-java-spring-boot/README.mdx')),
    metadata: webJavaSpringBoot,
  },
  {
    order: 1.7,
    id: 'native-ios-swift',
    Logo: safeLazy(async () => import('./native-ios-swift/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./native-ios-swift/README.mdx')),
    metadata: nativeIosSwift,
  },
  {
    order: 2,
    id: 'native-android',
    Logo: safeLazy(async () => import('./native-android/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./native-android/README.mdx')),
    metadata: nativeAndroid,
  },
  {
    order: 2,
    id: 'spa-vanilla',
    Logo: safeLazy(async () => import('./spa-vanilla/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./spa-vanilla/README.mdx')),
    metadata: spaVanilla,
  },
  {
    order: 2,
    id: 'web-nuxt',
    Logo: safeLazy(async () => import('./web-nuxt/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-nuxt/README.mdx')),
    metadata: webNuxt,
  },
  {
    order: 2,
    id: 'web-php',
    Logo: safeLazy(async () => import('./web-php/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-php/README.mdx')),
    metadata: webPhp,
  },
  {
    order: 2,
    id: 'web-ruby',
    Logo: safeLazy(async () => import('./web-ruby/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-ruby/README.mdx')),
    metadata: webRuby,
  },
  {
    order: 2.1,
    id: 'spa-webflow',
    Logo: safeLazy(async () => import('./spa-webflow/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./spa-webflow/README.mdx')),
    metadata: spaWebflow,
  },
  {
    order: 2.2,
    id: 'web-wordpress',
    Logo: safeLazy(async () => import('./web-wordpress/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-wordpress/README.mdx')),
    metadata: webWordpress,
  },
  {
    order: 2.3,
    id: 'web-wordpress-plugin',
    Logo: safeLazy(async () => import('./web-wordpress-plugin/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-wordpress-plugin/README.mdx')),
    metadata: webWordpressPlugin,
  },
  {
    order: 3,
    id: 'web-python',
    Logo: safeLazy(async () => import('./web-python/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-python/README.mdx')),
    metadata: webPython,
  },
  {
    order: 4,
    id: 'native-capacitor',
    Logo: safeLazy(async () => import('./native-capacitor/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./native-capacitor/README.mdx')),
    metadata: nativeCapacitor,
  },
  {
    order: 5,
    id: 'native-flutter',
    Logo: safeLazy(async () => import('./native-flutter/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./native-flutter/README.mdx')),
    metadata: nativeFlutter,
  },
  {
    order: 5,
    id: 'web-dotnet-core',
    Logo: safeLazy(async () => import('./web-dotnet-core/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-dotnet-core/README.mdx')),
    metadata: webDotnetCore,
  },
  {
    order: 5.1,
    id: 'web-dotnet-core-mvc',
    Logo: safeLazy(async () => import('./web-dotnet-core-mvc/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-dotnet-core-mvc/README.mdx')),
    metadata: webDotnetCoreMvc,
  },
  {
    order: 5.2,
    id: 'web-dotnet-core-blazor-server',
    Logo: safeLazy(async () => import('./web-dotnet-core-blazor-server/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-dotnet-core-blazor-server/README.mdx')),
    metadata: webDotnetCoreBlazorServer,
  },
  {
    order: 5.3,
    id: 'web-dotnet-core-blazor-wasm',
    Logo: safeLazy(async () => import('./web-dotnet-core-blazor-wasm/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-dotnet-core-blazor-wasm/README.mdx')),
    metadata: webDotnetCoreBlazorWasm,
  },
  {
    order: 6,
    id: 'web-outline',
    Logo: safeLazy(async () => import('./web-outline/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./web-outline/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./web-outline/README.mdx')),
    metadata: webOutline,
  },
  {
    order: 6.1,
    id: 'web-passport',
    Logo: safeLazy(async () => import('./web-passport/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./web-passport/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./web-passport/README.mdx')),
    metadata: webPassport,
  },
  {
    order: 999,
    id: 'web-gpt-plugin',
    Logo: safeLazy(async () => import('./web-gpt-plugin/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./web-gpt-plugin/README.mdx')),
    metadata: webGptPlugin,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'api-express',
    Logo: safeLazy(async () => import('./api-express/logo.svg?react')),
    DarkLogo: safeLazy(async () => import('./api-express/logo-dark.svg?react')),
    Component: safeLazy(async () => import('./api-express/README.mdx')),
    metadata: apiExpress,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'api-python',
    Logo: safeLazy(async () => import('./api-python/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./api-python/README.mdx')),
    metadata: apiPython,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'api-spring-boot',
    Logo: safeLazy(async () => import('./api-spring-boot/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./api-spring-boot/README.mdx')),
    metadata: apiSpringBoot,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'saml-idp',
    Logo: safeLazy(async () => import('./saml-idp/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./saml-idp/README.mdx')),
    metadata: samlIdp,
  },
  {
    order: Number.POSITIVE_INFINITY,
    id: 'third-party-oidc',
    Logo: safeLazy(async () => import('./third-party-oidc/logo.svg?react')),
    DarkLogo: undefined,
    Component: safeLazy(async () => import('./third-party-oidc/README.mdx')),
    metadata: thirdPartyOidc,
  },
]);
/* eslint-enable max-lines */
