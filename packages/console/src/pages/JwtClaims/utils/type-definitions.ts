import {
  JwtCustomizerTypeDefinitionKey,
  accessTokenPayloadTypeDefinition,
  jwtCustomizerUserContextTypeDefinition,
  clientCredentialsPayloadTypeDefinition,
} from '@/consts/jwt-customizer-type-definition';

import { type JwtClaimsFormType } from '../type';

export { JwtCustomizerTypeDefinitionKey } from '@/consts/jwt-customizer-type-definition';

export const buildAccessTokenJwtCustomizerContextTsDefinition = () => {
  return `declare ${jwtCustomizerUserContextTypeDefinition}

  declare ${accessTokenPayloadTypeDefinition}`;
};

export const buildClientCredentialsJwtCustomizerContextTsDefinition = () =>
  `declare ${clientCredentialsPayloadTypeDefinition}`;

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

export const buildJwtCustomizerUserContextType = () => `type ${
  JwtCustomizerTypeDefinitionKey.JwtCustomizerUserContext
} = ${getJwtCustomizerUserContextTsDefinition()}
`;

export const buildJwtCustomizerAccessTokenPayloadType = () => `type ${
  JwtCustomizerTypeDefinitionKey.AccessTokenPayload
} = ${getAccessTokenPayloadTsDefinition()}
`;

export const buildJwtCustomizerClientCredentialsPayloadType = () => `type ${
  JwtCustomizerTypeDefinitionKey.ClientCredentialsPayload
} = ${getClientCredentialsPayloadTsDefinition()}
`;
