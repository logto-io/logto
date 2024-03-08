import { type JwtTokenType } from './config.js';

export type JwtClaimsFormType = {
  tokenType: JwtTokenType;
  script?: string;
  environmentVariables?: Array<{ key: string; value: string }>;
  testSample?: {
    contextSample?: string;
    tokenSample?: string;
  };
};
