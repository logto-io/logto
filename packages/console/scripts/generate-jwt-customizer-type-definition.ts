import fs from 'node:fs';

import {
  accessTokenPayloadGuard,
  clientCredentialsPayloadGuard,
  jwtCustomizerUserContextGuard,
} from '@logto/schemas';
import prettier from 'prettier';
import { type ZodTypeAny } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';

const filePath = 'src/consts/jwt-customizer-type-definition.ts';

const typeIdentifiers = `export enum JwtCustomizerTypeDefinitionKey {
  JwtCustomizerUserContext = 'JwtCustomizerUserContext',
  AccessTokenPayload = 'AccessTokenPayload',
  ClientCredentialsPayload = 'ClientCredentialsPayload',
  EnvironmentVariables = 'EnvironmentVariables',
};`;

const inferTsDefinitionFromZod = (zodSchema: ZodTypeAny, identifier: string): string => {
  /**
   * We have z.lazy() used for defining Json objects in the zod schemas.
   * @see https://zod.dev/?id=json-type
   * zod-to-ts does not support z.lazy() yet. It will use the root type of the lazy schema. Which will be the identifier we pass to the function.
   * @see https://github.com/sachinraja/zod-to-ts?tab=readme-ov-file#zlazy
   *
   * The second argument is the root type identifier for the schema.
   * Here we use 'Record<string, unknown>' as the root type identifier. So all the Json objects will be inferred as Record<string, unknown>.
   * This is a limitation of zod-to-ts. We can't infer the exact type of the Json objects.
   * This solution is hacky but it works for now. The impact is it will always define the type identifer as Record<string, unknown>.
   */
  const { node } = zodToTs(zodSchema, 'Record<string, unknown>', { nativeEnums: 'union' });
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
