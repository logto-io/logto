import {
  JwtCustomizerTypeDefinitionKey,
  accessTokenPayloadTypeDefinition,
  clientCredentialsPayloadTypeDefinition,
  jwtCustomizerUserContextTypeDefinition,
  jwtCustomizerGrantContextTypeDefinition,
  jwtCustomizerUserInteractionContextTypeDefinition,
  jwtCustomizerApplicationContextTypeDefinition,
  jwtCustomizerApiContextTypeDefinition,
} from '@/consts/jwt-customizer-type-definition';

import { type JwtCustomizerForm } from '../type';

export {
  JwtCustomizerTypeDefinitionKey,
  accessTokenPayloadTypeDefinition,
  clientCredentialsPayloadTypeDefinition,
  jwtCustomizerUserContextTypeDefinition,
  jwtCustomizerGrantContextTypeDefinition,
  jwtCustomizerUserInteractionContextTypeDefinition,
  jwtCustomizerApplicationContextTypeDefinition,
} from '@/consts/jwt-customizer-type-definition';

export const buildAccessTokenJwtCustomizerContextTsDefinition = () => {
  return `declare ${jwtCustomizerUserContextTypeDefinition}

  declare ${jwtCustomizerGrantContextTypeDefinition}

  declare ${jwtCustomizerApiContextTypeDefinition}

  declare ${accessTokenPayloadTypeDefinition}

  declare ${jwtCustomizerUserInteractionContextTypeDefinition}

  declare ${jwtCustomizerApplicationContextTypeDefinition}`;
};

export const buildClientCredentialsJwtCustomizerContextTsDefinition = () =>
  `declare ${clientCredentialsPayloadTypeDefinition}

  declare ${jwtCustomizerApplicationContextTypeDefinition}

  declare ${jwtCustomizerApiContextTypeDefinition}`;

export const buildEnvironmentVariablesTypeDefinition = (
  envVariables?: JwtCustomizerForm['environmentVariables']
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
