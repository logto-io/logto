export type ApplicationCase = {
  framework: string;
  name: string;
  description: string;
  guideFilename: string;
  sample?: {
    repo: string;
    path: string;
  };
  redirectUri?: string;
  postSignOutRedirectUri?: string;
};

const nextJs: ApplicationCase = {
  framework: 'Next.js',
  name: 'Next.js App',
  description: 'This is a Next.js app',
  guideFilename: 'web-next',
  sample: {
    repo: 'js',
    path: 'packages/next-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const nextJsAppRouter: ApplicationCase = {
  framework: 'Next.js (App Router)',
  name: 'Next.js (App Router) App',
  description: 'This is a Next.js (App Router) app',
  guideFilename: 'web-next-app-router',
  sample: {
    repo: 'js',
    path: 'packages/next-app-dir-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const express: ApplicationCase = {
  framework: 'Express',
  name: 'Express App',
  description: 'This is a Express app',
  guideFilename: 'web-express',
  sample: {
    repo: 'js',
    path: 'packages/express-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
};

const go: ApplicationCase = {
  framework: 'Go',
  name: 'Go App',
  description: 'This is a Go app',
  guideFilename: 'web-go',
  sample: {
    repo: 'go',
    path: 'gin-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const php: ApplicationCase = {
  framework: 'PHP',
  name: 'PHP App',
  description: 'This is a PHP app',
  guideFilename: 'web-php',
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const python: ApplicationCase = {
  framework: 'Python',
  name: 'Python App',
  description: 'This is a Python app',
  guideFilename: 'web-python',
  sample: {
    repo: 'python',
    path: 'samples',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const remix: ApplicationCase = {
  framework: 'Remix',
  name: 'Remix App',
  description: 'This is a Remix app',
  guideFilename: 'web-remix',
  redirectUri: 'https://my.test.app/sign-in',
};

const aspNetCore: ApplicationCase = {
  framework: 'ASP.NET Core',
  name: 'ASP.NET Core App',
  description: 'This is an ASP.NET Core app',
  guideFilename: 'web-asp-net-core',
  sample: {
    repo: 'csharp',
    path: 'sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const outline: ApplicationCase = {
  framework: 'Outline',
  name: 'Outline App',
  description: 'This is an Outline app',
  guideFilename: 'web-outline',
  redirectUri: 'https://my.test.app/auth/oidc.callback',
};

const chatGptPlugin: ApplicationCase = {
  framework: 'ChatGPT plugin',
  name: 'ChatGPT plugin App',
  description: 'This is a ChatGPT plugin app',
  guideFilename: 'web-gpt-plugin',
  redirectUri: 'https://chat.openai.com/aip/fake-plugin-id/oauth/callback',
};

const react: ApplicationCase = {
  framework: 'React',
  name: 'React App',
  description: 'This is a React app',
  guideFilename: 'spa-react',
  sample: {
    repo: 'js',
    path: 'packages/react-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const vue: ApplicationCase = {
  framework: 'Vue',
  name: 'Vue App',
  description: 'This is a Vue app',
  guideFilename: 'spa-vue',
  sample: {
    repo: 'js',
    path: 'packages/vue-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const vanilla: ApplicationCase = {
  framework: 'Vanilla JS',
  name: 'Vanilla JS App',
  description: 'This is a Vanilla JS app',
  guideFilename: 'spa-vanilla',
  sample: {
    repo: 'js',
    path: 'packages/browser-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

const iosSwift: ApplicationCase = {
  framework: 'iOS (Swift)',
  name: 'iOS (Swift) App',
  description: 'This is an iOS (Swift) app',
  guideFilename: 'native-ios-swift',
  sample: {
    repo: 'swift',
    path: 'Demos/SwiftUI%20Demo',
  },
  redirectUri: 'io.logto://callback',
};

const androidJava: ApplicationCase = {
  framework: 'Android (Java)',
  name: 'Android (Java) App',
  description: 'This is an Android (Java) app',
  guideFilename: 'native-android-java',
  sample: {
    repo: 'kotlin',
    path: 'android-sample-java',
  },
  redirectUri: 'io.logto.android://io.logto.sample/callback',
};

const androidKotlin: ApplicationCase = {
  framework: 'Android (Kotlin)',
  name: 'Android (Kotlin) App',
  description: 'This is an Android (Kotlin) app',
  guideFilename: 'native-android-kt',
  sample: {
    repo: 'kotlin',
    path: 'android-sample-kotlin',
  },
  redirectUri: 'io.logto.android://io.logto.sample/callback',
};

const capacitorJs: ApplicationCase = {
  framework: 'Capacitor JS',
  name: 'Capacitor JS App',
  description: 'This is a Capacitor JS app',
  guideFilename: 'native-capacitor',
  redirectUri: 'com.example.app://callback',
  postSignOutRedirectUri: 'com.example.app://callback',
};

const flutter: ApplicationCase = {
  framework: 'Flutter',
  name: 'Flutter App',
  description: 'This is a Flutter app',
  guideFilename: 'native-flutter',
  redirectUri: 'io.logto://callback',
};

const machine2machine: ApplicationCase = {
  framework: 'Machine-to-machine',
  name: 'Machine-to-machine App',
  description: 'This is a Machine-to-machine app',
  guideFilename: 'm2m-general',
};

export const initialApp: ApplicationCase = {
  ...nextJs,
  name: 'Initial App',
  description: 'This is the first app to be created',
};

export const testAppCases: ApplicationCase[] = [
  // WebApp
  nextJs,
  nextJsAppRouter,
  express,
  go,
  php,
  python,
  remix,
  aspNetCore,
  outline,
  chatGptPlugin,
  // SPA
  react,
  vue,
  vanilla,
  iosSwift,
  androidJava,
  androidKotlin,
  capacitorJs,
  flutter,
  // M2M
  machine2machine,
];
