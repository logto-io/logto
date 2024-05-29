import { ApplicationType } from '@logto/schemas';

export type ApplicationCase = {
  framework: string;
  name: string;
  description: string;
  guideFilename: string;
  sample: {
    repo: string;
    path: string;
  };
  redirectUri: string;
  postSignOutRedirectUri: string;
};

export const initialApp: ApplicationCase = {
  framework: 'Next.js (App Router)',
  name: 'Next.js App',
  description: 'This is a Next.js app',
  guideFilename: 'web-next',
  sample: {
    repo: 'js',
    path: 'packages/next-server-actions-sample',
  },
  redirectUri: 'https://my.test.app/sign-in',
  postSignOutRedirectUri: 'https://my.test.app/sign-out',
};

export const testApp: ApplicationCase = {
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

export const thirdPartyApp: Omit<
  ApplicationCase,
  'sample' | 'redirectUri' | 'postSignOutRedirectUri'
> = {
  framework: 'OIDC',
  name: 'OIDC third party app',
  description: 'This is a OIDC third party app',
  guideFilename: 'third-party-oidc',
};

export const frameworkGroupLabels = [
  'Popular and for you',
  'Traditional web app',
  'Single page app',
  'Native',
  'Machine-to-machine',
  'Third-party',
] as const;

export type ApplicationMetadata = {
  type: ApplicationType;
  name: string;
  description: string;
};

export const applicationTypesMetadata = Object.entries(ApplicationType).map(([key, value]) => ({
  type: value,
  name: `${key} app`,
  description: `This is a ${key} app`,
})) satisfies ApplicationMetadata[];
