export type JwtClaimsFormType = {
  script?: string;
  environmentVariables?: Array<{ key: string; value: string }>;
  contextSample?: string;
  tokenSample?: string;
};
