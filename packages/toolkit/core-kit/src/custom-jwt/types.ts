import { jsonObjectGuard } from '@logto/connector-kit';
import { z } from 'zod';

export const jwtCustomizerGuard = z.object({
  script: z.string(),
  environmentVariables: z.record(z.string()).optional(),
  contextSample: jsonObjectGuard.optional(),
});

export enum LogtoJwtTokenKeyType {
  AccessToken = 'access-token',
  ClientCredentials = 'client-credentials',
}

/**
 * This guard is for cloud API use (request body guard).
 * Since the cloud API will be use by both testing and production, should keep the fields as general as possible.
 * The response guard for the cloud API is `jsonObjectGuard` since it extends the `token` with extra claims.
 */
const commonJwtCustomizerGuard = jwtCustomizerGuard
  .pick({ script: true, environmentVariables: true })
  .required({ script: true })
  .extend({
    token: jsonObjectGuard,
  });

export const customJwtFetcherGuard = z.discriminatedUnion('tokenType', [
  commonJwtCustomizerGuard.extend({
    tokenType: z.literal(LogtoJwtTokenKeyType.AccessToken),
    context: jsonObjectGuard,
  }),
  commonJwtCustomizerGuard.extend({
    tokenType: z.literal(LogtoJwtTokenKeyType.ClientCredentials),
  }),
]);

export type CustomJwtFetcher = z.infer<typeof customJwtFetcherGuard>;
