import {
  JwtCustomizerTypeDefinitionKey,
  accessTokenPayloadTypeDefinition,
  clientCredentialsPayloadTypeDefinition,
  jwtCustomizerUserContextTypeDefinition,
  jwtCustomizerGrantContextTypeDefinition,
  jwtCustomizerUserInteractionContextTypeDefinition,
  jwtCustomizerApplicationContextTypeDefinition,
  jwtCustomizerOrganizationContextTypeDefinition,
  jwtCustomizerApiContextTypeDefinition,
} from '@/consts/jwt-customizer-type-definition';
import { isValidEnvironmentVariableKey } from '@/utils/validator';

import { type JwtCustomizerForm } from '../type';

export {
  JwtCustomizerTypeDefinitionKey,
  accessTokenPayloadTypeDefinition,
  clientCredentialsPayloadTypeDefinition,
  jwtCustomizerUserContextTypeDefinition,
  jwtCustomizerGrantContextTypeDefinition,
  jwtCustomizerUserInteractionContextTypeDefinition,
  jwtCustomizerApplicationContextTypeDefinition,
  jwtCustomizerOrganizationContextTypeDefinition,
} from '@/consts/jwt-customizer-type-definition';

export const buildAccessTokenJwtCustomizerContextTsDefinition = () => {
  return `declare ${jwtCustomizerUserContextTypeDefinition}

  declare ${jwtCustomizerGrantContextTypeDefinition}

  declare ${jwtCustomizerApiContextTypeDefinition}

  declare ${accessTokenPayloadTypeDefinition}

  declare ${jwtCustomizerUserInteractionContextTypeDefinition}

  declare ${jwtCustomizerApplicationContextTypeDefinition}

  declare ${jwtCustomizerOrganizationContextTypeDefinition}`;
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
    // Align with request payload filtering (`key && value`) and form key validation
    // so Monaco only types env vars that can actually be used at runtime.
    .map(({ key, value }) => ({ key: key.trim(), value }))
    .filter(
      ({ key, value }) => Boolean(key) && Boolean(value) && isValidEnvironmentVariableKey(key)
    )
    // Quote keys so keys like `0FOO` stay valid TypeScript property names.
    .map(({ key }) => `${JSON.stringify(key)}: string`)
    .join(';\n')}
    }`
    : 'undefined';

  return `declare type ${JwtCustomizerTypeDefinitionKey.EnvironmentVariables} = ${typeDefinition}`;
};
