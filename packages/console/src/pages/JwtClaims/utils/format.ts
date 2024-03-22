import {
  LogtoJwtTokenPath,
  type AccessTokenJwtCustomizer,
  type ClientCredentialsJwtCustomizer,
} from '@logto/schemas';

import type { JwtClaimsFormType } from '../type';

import {
  defaultAccessTokenPayload,
  defaultClientCredentialsPayload,
  defaultUserTokenContextData,
} from './config';

const formatEnvVariablesResponseToFormData = (
  enVariables?: AccessTokenJwtCustomizer['envVars']
) => {
  if (!enVariables) {
    return;
  }

  return Object.entries(enVariables).map(([key, value]) => ({ key, value }));
};

const formatSampleCodeJsonToString = (sampleJson?: AccessTokenJwtCustomizer['contextSample']) => {
  if (!sampleJson) {
    return;
  }

  return JSON.stringify(sampleJson, null, 2);
};

export const formatResponseDataToFormData = <T extends LogtoJwtTokenPath>(
  tokenType: T,
  data?: T extends LogtoJwtTokenPath.AccessToken
    ? AccessTokenJwtCustomizer
    : ClientCredentialsJwtCustomizer
): JwtClaimsFormType => {
  return {
    script: data?.script ?? '', // React-hook-form won't mutate the value if it's undefined
    tokenType,
    environmentVariables: formatEnvVariablesResponseToFormData(data?.envVars) ?? [
      { key: '', value: '' },
    ],
    testSample: {
      tokenSample: formatSampleCodeJsonToString(data?.tokenSample),
      // Technically, contextSample is always undefined for client credentials token type
      contextSample: formatSampleCodeJsonToString(data?.contextSample),
    },
  };
};

const formatEnvVariablesFormData = (envVariables: JwtClaimsFormType['environmentVariables']) => {
  if (!envVariables) {
    return;
  }

  const entries = envVariables.filter(({ key, value }) => key && value);

  if (entries.length === 0) {
    return;
  }

  return Object.fromEntries(entries.map(({ key, value }) => [key, value]));
};

const formatSampleCodeStringToJson = (sampleCode?: string) => {
  if (!sampleCode) {
    return;
  }

  try {
    // eslint-disable-next-line no-restricted-syntax -- guarded by back-end validation
    return JSON.parse(sampleCode) as Record<string, unknown>;
  } catch {}
};

export const formatFormDataToRequestData = (data: JwtClaimsFormType) => {
  return {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- parse empty string as undefined
    script: data.script || undefined,
    envVars: formatEnvVariablesFormData(data.environmentVariables),
    tokenSample: formatSampleCodeStringToJson(data.testSample?.tokenSample),
    // Technically, contextSample is always undefined for client credentials token type
    contextSample: formatSampleCodeStringToJson(data.testSample?.contextSample),
  };
};

export const formatFormDataToTestRequestPayload = ({
  tokenType,
  script,
  environmentVariables,
  testSample,
}: JwtClaimsFormType) => {
  const defaultTokenSample =
    tokenType === LogtoJwtTokenPath.AccessToken
      ? defaultAccessTokenPayload
      : defaultClientCredentialsPayload;

  const defaultContextSample =
    tokenType === LogtoJwtTokenPath.AccessToken ? defaultUserTokenContextData : undefined;

  return {
    tokenType,
    payload: {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- parse empty string as undefined
      script: script || undefined,
      envVars: formatEnvVariablesFormData(environmentVariables),
      tokenSample: formatSampleCodeStringToJson(testSample?.tokenSample) ?? defaultTokenSample,
      contextSample:
        formatSampleCodeStringToJson(testSample?.contextSample) ?? defaultContextSample,
    },
  };
};

export const getApiPath = (tokenType: LogtoJwtTokenPath) =>
  `api/configs/jwt-customizer/${tokenType}`;
