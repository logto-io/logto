import type { LogtoJwtTokenPath } from '@logto/schemas';

export type JwtClaimsFormType = {
  tokenType: LogtoJwtTokenPath;
  script?: string;
  environmentVariables?: Array<{ key: string; value: string }>;
  testSample?: {
    contextSample?: string;
    tokenSample?: string;
  };
};
