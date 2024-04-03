import type { AccessTokenJwtCustomizer, ClientCredentialsJwtCustomizer } from '@logto/schemas';
import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { z } from 'zod';

export type JwtCustomizerForm = {
  tokenType: LogtoJwtTokenKeyType;
  script: string;
  environmentVariables?: Array<{ key: string; value: string }>;
  testSample: {
    contextSample?: string;
    tokenSample?: string;
  };
};

export type Action = 'create' | 'edit';

export type JwtCustomizer<T extends LogtoJwtTokenKeyType> =
  T extends LogtoJwtTokenKeyType.AccessToken
    ? AccessTokenJwtCustomizer
    : ClientCredentialsJwtCustomizer;

export const pageParamsGuard = z.object({
  tokenType: z.nativeEnum(LogtoJwtTokenKeyType),
  action: z.union([z.literal('create'), z.literal('edit')]),
});
