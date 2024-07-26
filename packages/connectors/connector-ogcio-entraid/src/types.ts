import { z } from 'zod';

import { oidcPromptsGuard } from '@logto/connector-kit';

export const azureADConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  cloudInstance: z.string(),
  tenantId: z.string(),
  prompts: oidcPromptsGuard,
});

export type AzureADConfig = z.infer<typeof azureADConfigGuard>;

export const accessTokenResponseGuard = z.object({
  accessToken: z.string(),
  scopes: z.array(z.string()),
  tokenType: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  id: z.string(),
  displayName: z.string().nullish(),
  givenName: z.string().nullish(),
  surname: z.string().nullish(),
  userPrincipalName: z.string().nullish(),
  jobTitle: z.string().nullish(),
  mail: z.string().nullish(),
  mobilePhone: z.string().nullish(),
  officeLocation: z.string().nullish(),
  preferredLanguage: z.string().nullish(),
  businessPhones: z.array(z.string()).nullish(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});
