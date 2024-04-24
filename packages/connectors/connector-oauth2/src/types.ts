import { z } from 'zod';

import { oauth2ConfigGuard } from './oauth2/types.js';

export const profileMapGuard = z
  .object({
    id: z.string().optional().default('id'),
    email: z.string().optional().default('email'),
    phone: z.string().optional().default('phone'),
    name: z.string().optional().default('name'),
    avatar: z.string().optional().default('avatar'),
  })
  .optional()
  .default({
    id: 'id',
    email: 'email',
    phone: 'phone',
    name: 'name',
    avatar: 'avatar',
  });

export type ProfileMap = z.infer<typeof profileMapGuard>;

export const userProfileGuard = z.object({
  id: z.string().or(z.number()).transform(String),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileGuard>;

const tokenEndpointResponseTypeGuard = z
  .enum(['query-string', 'json'])
  .optional()
  .default('query-string');

export type TokenEndpointResponseType = z.input<typeof tokenEndpointResponseTypeGuard>;

export const oauth2ConnectorConfigGuard = oauth2ConfigGuard.extend({
  userInfoEndpoint: z.string(),
  tokenEndpointResponseType: tokenEndpointResponseTypeGuard,
  profileMap: profileMapGuard,
  customConfig: z.record(z.string()).optional(),
});

export type Oauth2ConnectorConfig = z.infer<typeof oauth2ConnectorConfigGuard>;
