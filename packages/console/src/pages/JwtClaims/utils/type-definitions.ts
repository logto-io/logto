import {
  jwtCustomizerUserContextGuard,
  accessTokenPayloadGuard,
  clientCredentialsPayloadGuard,
} from '@logto/schemas';
import { type ZodTypeAny } from 'zod';
import { zodToTs, printNode } from 'zod-to-ts';

import { type JwtClaimsFormType } from '../type';

const inferTsDefinitionFromZod = (zodSchema: ZodTypeAny, identifier: string): string => {
  const { node } = zodToTs(zodSchema, identifier);

  return printNode(node);
};

export enum JwtCustomizerTypeDefinitionKey {
  JwtCustomizerUserContext = 'JwtCustomizerUserContext',
  AccessTokenPayload = 'AccessTokenPayload',
  ClientCredentialsPayload = 'ClientCredentialsPayload',
  EnvironmentVariables = 'EnvironmentVariables',
}

const getJwtCustomizerUserContextTsDefinition = () =>
  inferTsDefinitionFromZod(
    jwtCustomizerUserContextGuard,
    JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext
  );

const getAccessTokenPayloadTsDefinition = () =>
  inferTsDefinitionFromZod(
    accessTokenPayloadGuard,
    JwtCustomizerTypeDefinitionKey.AccessTokenPayload
  );

const getClientCredentialsPayloadTsDefinition = () =>
  inferTsDefinitionFromZod(
    clientCredentialsPayloadGuard,
    JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext
  );

export const buildAccessTokenJwtCustomizerContextTsDefinition = () => {
  return `declare type ${
    JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext
  } = ${getJwtCustomizerUserContextTsDefinition()};

  declare type ${
    JwtCustomizerTypeDefinitionKey.AccessTokenPayload
  } = ${getAccessTokenPayloadTsDefinition()};
  `;
};

export const buildClientCredentialsJwtCustomizerContextTsDefinition = () => `declare type ${
  JwtCustomizerTypeDefinitionKey.ClientCredentialsPayload
} = ${getClientCredentialsPayloadTsDefinition()};
`;

export const buildEnvironmentVariablesTypeDefinition = (
  envVariables?: JwtClaimsFormType['environmentVariables']
) => {
  const typeDefinition = envVariables
    ? `{
  ${envVariables
    .filter(({ key }) => Boolean(key))
    .map(({ key }) => `${key}: string`)
    .join(';\n')}
    }`
    : 'undefined';

  return `declare type ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables} = ${typeDefinition}`;
};
