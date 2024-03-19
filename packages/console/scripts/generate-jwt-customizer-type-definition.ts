import fs from 'node:fs';

import {
  jwtCustomizerUserContextGuard,
  accessTokenPayloadGuard,
  clientCredentialsPayloadGuard,
} from '@logto/schemas';
import prettier from 'prettier';
import { type ZodTypeAny } from 'zod';
import { zodToTs, printNode } from 'zod-to-ts';

const filePath = 'src/consts/jwt-customizer-type-definition.ts';

const typeIdentifiers = `export enum JwtCustomizerTypeDefinitionKey {
  JwtCustomizerUserContext = 'JwtCustomizerUserContext',
  AccessTokenPayload = 'AccessTokenPayload',
  ClientCredentialsPayload = 'ClientCredentialsPayload',
  EnvironmentVariables = 'EnvironmentVariables',
};`;

const inferTsDefinitionFromZod = (zodSchema: ZodTypeAny, identifier: string): string => {
  const { node } = zodToTs(zodSchema, identifier);
  const typeDefinition = printNode(node);

  return `type ${identifier} = ${typeDefinition};`;
};

// Create the jwt-customizer-type-definition.ts file
const createJwtCustomizerTypeDefinitions = async () => {
  const jwtCustomizerUserContextTypeDefinition = inferTsDefinitionFromZod(
    jwtCustomizerUserContextGuard,
    'JwtCustomizerUserContext'
  );

  const accessTokenPayloadTypeDefinition = inferTsDefinitionFromZod(
    accessTokenPayloadGuard,
    'AccessTokenPayload'
  );

  const clientCredentialsPayloadTypeDefinition = inferTsDefinitionFromZod(
    clientCredentialsPayloadGuard,
    'ClientCredentialsPayload'
  );

  const fileContent = `/* This file is auto-generated. Do not modify it manually. */
${typeIdentifiers}

export const jwtCustomizerUserContextTypeDefinition = \`${jwtCustomizerUserContextTypeDefinition}\`;

export const accessTokenPayloadTypeDefinition = \`${accessTokenPayloadTypeDefinition}\`;

export const clientCredentialsPayloadTypeDefinition = \`${clientCredentialsPayloadTypeDefinition}\`;
`;

  const formattedFileContent = await prettier.format(fileContent, {
    parser: 'typescript',
    tabWidth: 2,
    singleQuote: true,
  });

  fs.writeFileSync(filePath, formattedFileContent);
};

void createJwtCustomizerTypeDefinitions();
