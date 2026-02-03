import fs from 'node:fs';

import {
  accessTokenPayloadGuard,
  clientCredentialsPayloadGuard,
  jwtCustomizerGrantContextGuard,
  jwtCustomizerUserContextGuard,
  jwtCustomizerUserInteractionContextGuard,
} from '@logto/schemas';
import prettier from 'prettier';
import { type ZodTypeAny } from 'zod';
import { printNode, zodToTs } from 'zod-to-ts';

import { jwtCustomizerApiContextTypeDefinition } from './custom-jwt-customizer-type-definition.js';

const filePath = 'src/consts/jwt-customizer-type-definition.ts';

const typeIdentifiers = `export enum JwtCustomizerTypeDefinitionKey {
  JwtCustomizerUserContext = 'JwtCustomizerUserContext',
  JwtCustomizerGrantContext = 'JwtCustomizerGrantContext',
  JwtCustomizerUserInteractionContext = 'JwtCustomizerUserInteractionContext',
  AccessTokenPayload = 'AccessTokenPayload',
  ClientCredentialsPayload = 'ClientCredentialsPayload',
  EnvironmentVariables = 'EnvironmentVariables',
  CustomJwtApiContext = 'CustomJwtApiContext',
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

/**
 * EnterpriseSsoUserInfo zod guard uses `catchall(jsonGuard)` to extend the type to allow any additional properties.
 * However, the `catchall()` schema is not recognized by zod-to-ts,
 * so it will not generate the index signature for the type.
 * To fix this, we manually add the index signature to the type definition.
 *
 * Map the `enterpriseSsoUserInfo?: { ... } | undefined;` to
 * `enterpriseSsoUserInfo?: { ...; [k: string]?: unknown; } | undefined;`
 */
const addIndexSignatureToEnterpriseSsoUserInfo = (source: string) => {
  // 1. Capture in segments: prefix = "enterpriseSsoUserInfo?: {"
  //    body   = {...original properties...}
  //    suffix = "} | undefined;" (may include a semicolon/space)
  const blockReg = /(\benterpriseSsoUserInfo\?\s*:\s*{)([\S\s]*?)(}\s*\|\s*undefined\s*;?)/g;

  return source.replaceAll(blockReg, (full, prefix: string, body: string, suffix: string) => {
    // 2. Add the fallback index signature to the body
    const indent = '    ';
    const addition = `${indent}[k: string]?: unknown;\n`;

    return `${prefix}${body}${addition}${suffix}`;
  });
};

// Create the jwt-customizer-type-definition.ts file
const createJwtCustomizerTypeDefinitions = async () => {
  const jwtCustomizerUserContextTypeDefinition = inferTsDefinitionFromZod(
    jwtCustomizerUserContextGuard,
    'JwtCustomizerUserContext'
  );

  const jwtCustomizerGrantContextTypeDefinition = inferTsDefinitionFromZod(
    jwtCustomizerGrantContextGuard,
    'JwtCustomizerGrantContext'
  );

  const jwtCustomizerUserInteractionContextTypeDefinition =
    addIndexSignatureToEnterpriseSsoUserInfo(
      inferTsDefinitionFromZod(
        jwtCustomizerUserInteractionContextGuard,
        'JwtCustomizerUserInteractionContext'
      )
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

export const jwtCustomizerGrantContextTypeDefinition = \`${jwtCustomizerGrantContextTypeDefinition}\`;

export const jwtCustomizerUserInteractionContextTypeDefinition = \`${jwtCustomizerUserInteractionContextTypeDefinition}\`;

export const accessTokenPayloadTypeDefinition = \`${accessTokenPayloadTypeDefinition}\`;

export const clientCredentialsPayloadTypeDefinition = \`${clientCredentialsPayloadTypeDefinition}\`;

export const jwtCustomizerApiContextTypeDefinition = \`${jwtCustomizerApiContextTypeDefinition}\`;
`;

  const formattedFileContent = await prettier.format(fileContent, {
    parser: 'typescript',
    tabWidth: 2,
    singleQuote: true,
  });

  fs.writeFileSync(filePath, formattedFileContent);
};

void createJwtCustomizerTypeDefinitions();
