import { LogtoJwtTokenKeyType, type AccessTokenJwtCustomizer, type Json } from '@logto/schemas';

import type { JwtCustomizer, JwtCustomizerForm } from '../type';

import {
  defaultAccessTokenJwtCustomizerCode,
  defaultAccessTokenPayload,
  defaultClientCredentialsJwtCustomizerCode,
  defaultClientCredentialsPayload,
  defaultUserTokenContextData,
} from './config';

const formatEnvVariablesResponseToFormData = (
  enVariables?: AccessTokenJwtCustomizer['environmentVariables']
) => {
  if (!enVariables) {
    return;
  }

  return Object.entries(enVariables).map(([key, value]) => ({ key, value }));
};

const formatEnvVariablesFormDataToRequest = (
  envVariables: JwtCustomizerForm['environmentVariables']
) => {
  if (!envVariables) {
    return;
  }

  const entries = envVariables.filter(({ key, value }) => key && value);

  if (entries.length === 0) {
    return;
  }

  return Object.fromEntries(entries.map(({ key, value }) => [key, value]));
};

const formatSampleCodeJsonToString = (sampleJson?: Json) => {
  if (!sampleJson) {
    return;
  }

  return JSON.stringify(sampleJson, null, 2);
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

const defaultValues = Object.freeze({
  [LogtoJwtTokenKeyType.AccessToken]: {
    script: defaultAccessTokenJwtCustomizerCode,
    tokenSample: defaultAccessTokenPayload,
    contextSample: defaultUserTokenContextData,
  },
  [LogtoJwtTokenKeyType.ClientCredentials]: {
    script: defaultClientCredentialsJwtCustomizerCode,
    tokenSample: defaultClientCredentialsPayload,
    contextSample: undefined,
  },
});

export const formatResponseDataToFormData = <T extends LogtoJwtTokenKeyType>(
  tokenType: T,
  data?: JwtCustomizer<T>
): JwtCustomizerForm => {
  return {
    tokenType,
    script: data?.script ?? defaultValues[tokenType].script,
    environmentVariables: formatEnvVariablesResponseToFormData(data?.environmentVariables) ?? [
      { key: '', value: '' },
    ],
    testSample: {
      tokenSample: formatSampleCodeJsonToString(
        data?.tokenSample ?? defaultValues[tokenType].tokenSample
      ),
      contextSample: formatSampleCodeJsonToString(
        data?.contextSample ?? defaultValues[tokenType].contextSample
      ),
    },
  };
};

export const formatFormDataToRequestData = (data: JwtCustomizerForm) => {
  return {
    script: data.script,
    environmentVariables: formatEnvVariablesFormDataToRequest(data.environmentVariables),
    tokenSample: formatSampleCodeStringToJson(data.testSample.tokenSample),
    contextSample: formatSampleCodeStringToJson(data.testSample.contextSample),
  };
};

export const formatFormDataToTestRequestPayload = ({
  tokenType,
  script,
  environmentVariables,
  testSample,
}: JwtCustomizerForm) => {
  return {
    tokenType,
    script,
    environmentVariables: formatEnvVariablesFormDataToRequest(environmentVariables),
    token:
      formatSampleCodeStringToJson(testSample.tokenSample) ?? defaultValues[tokenType].tokenSample,
    context:
      formatSampleCodeStringToJson(testSample.contextSample) ??
      defaultValues[tokenType].contextSample,
  };
};
