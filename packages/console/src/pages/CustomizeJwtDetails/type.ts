import type { AccessTokenJwtCustomizer, ClientCredentialsJwtCustomizer } from '@logto/schemas';
import { LogtoJwtTokenPath } from '@logto/schemas';
import { z } from 'zod';

export type JwtCustomizerForm = {
  tokenType: LogtoJwtTokenPath;
  script: string;
  environmentVariables?: Array<{ key: string; value: string }>;
  testSample: {
    contextSample?: string;
    tokenSample?: string;
  };
};

export type Action = 'create' | 'edit';

export type JwtCustomizer<T extends LogtoJwtTokenPath> = T extends LogtoJwtTokenPath.AccessToken
  ? AccessTokenJwtCustomizer
  : ClientCredentialsJwtCustomizer;

export const pageParamsGuard = z.object({
  tokenType: z.nativeEnum(LogtoJwtTokenPath),
  action: z.union([z.literal('create'), z.literal('edit')]),
});
