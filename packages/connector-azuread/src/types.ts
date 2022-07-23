import { z } from 'zod';

export const azureADConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  cloudInstance: z.string(),
  tennantId: z.string(),
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
  displayName: z.string(),
  given_name: z.string().optional().nullable(),
  surname: z.string().optional().nullable(),
  userPrincipalName: z.string().optional(),
  JobTitle: z.string().optional().nullable(),
  mail: z.string(),
  MobilePhone: z.string().optional().nullable(),
  officeLocation: z.boolean().optional().nullable(),
  preferredLanguage: z.string().optional().nullable(),
  businessPhones: z.array(z.string()).optional().nullable(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;
