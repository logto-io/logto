import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';

import { isKeyInObject, isObject, type Optional } from '@silverhand/essentials';
import type Router from 'koa-router';
import { OpenAPIV3 } from 'openapi-types';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';
import { devConsole } from '#src/utils/console.js';

import { isKoaAuthMiddleware } from '../../../middleware/koa-auth/index.js';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** The tag name used in the supplement document to indicate that the operation is cloud only. */
const cloudOnlyTag = 'Cloud only';
/** The tag name is used in the supplement document to indicate that the corresponding API operation is a dev feature. */
export const devFeatureTag = 'Dev feature';

const reservedTags = new Set([cloudOnlyTag, devFeatureTag]);

/**
 * Get the root component name from the given absolute path.
 * @example '/organizations/:id' -> 'organizations'
 */
export const getRootComponent = (path?: string) => path?.split('/')[1];

/** Map from root component name to tag name. */
const tagMap = new Map([
  ['logs', 'Audit logs'],
  ['sign-in-exp', 'Sign-in experience'],
  ['sso-connectors', 'SSO connectors'],
  ['sso-connector-providers', 'SSO connector providers'],
  ['.well-known', 'Well-known'],
  ['saml-applications', 'SAML applications'],
  ['saml', 'SAML applications auth flow'],
  ['one-time-tokens', 'One-time tokens'],
  ['custom-profile-fields', 'Custom profile fields'],
]);

if (EnvSet.values.isDevFeaturesEnabled) {
  // TagMap.set('foo-bar', 'Foo bar');
}

/**
 * Build a tag name from the given absolute path. The function will get the root component name
 * from the path and try to find the mapping in the {@link tagMap}. If the mapping is not found,
 * the function will convert the name to sentence case.
 *
 * @example '/organization-roles' -> 'Organization roles'
 * @example '/logs/:id' -> 'Audit logs'
 * @see {@link tagMap} for the full list of mappings.
 */
export const buildTag = (path: string) => {
  const rootComponent = getRootComponent(path);
  assert(rootComponent, `Cannot find root component for path ${path}.`);
  return tagMap.get(rootComponent) ?? capitalize(rootComponent).replaceAll('-', ' ');
};

/**
 * Recursively find all supplement files (files end with `.openapi.json`) for the given
 * directory.
 */
/* eslint-disable @silverhand/fp/no-mutating-methods, no-await-in-loop */
export type FindSupplementFilesOptions = {
  excludeDirectories?: string[];
  includeDirectories?: string[];
};

export const findSupplementFiles = async (
  directory: string,
  option?: FindSupplementFilesOptions
) => {
  const result: string[] = [];

  for (const file of await fs.readdir(directory)) {
    const stats = await fs.stat(path.join(directory, file));

    if (
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      option?.excludeDirectories?.includes(file) ||
      (option?.includeDirectories && !option.includeDirectories.includes(file))
    ) {
      continue;
    }

    if (stats.isDirectory()) {
      result.push(...(await findSupplementFiles(path.join(directory, file))));
    } else if (file.endsWith('.openapi.json')) {
      result.push(path.join(directory, file));
    }
  }

  return result;
};
/* eslint-enable @silverhand/fp/no-mutating-methods, no-await-in-loop */

/**
 * Normalize the path to the OpenAPI path by adding `/api` prefix and replacing the path parameters
 * with OpenAPI path parameters.
 *
 * @example
 * normalizePath('/organization/:id') -> '/api/organization/{id}'
 */
export const normalizePath = (path: string) =>
  `/api${path}`
    .split('/')
    .map((part) => (part.startsWith(':') ? `{${part.slice(1)}}` : part))
    .join('/');

/**
 * Check if the supplement paths only contains operations (path + method) that are in the original
 * paths. The function will also check if the supplement operations contain `tags` property, which
 * is not allowed in our case.
 */
const validateSupplementPaths = (
  originalPaths: Map<string, Optional<OpenAPIV3.PathItemObject>>,
  supplementPaths: Map<string, unknown>
) => {
  for (const [path, operations] of supplementPaths) {
    if (!operations) {
      continue;
    }

    const originalOperations = originalPaths.get(path);
    assert(originalOperations, `Supplement document contains extra path: \`${path}\`.`);

    assert(
      typeof operations === 'object' && !Array.isArray(operations),
      `Supplement document contains invalid operations on path \`${path}\`.`
    );

    const originalKeys = new Set(Object.keys(originalOperations));
    for (const method of Object.values(OpenAPIV3.HttpMethods)) {
      if (isKeyInObject(operations, method)) {
        if (!originalKeys.has(method)) {
          throw new TypeError(
            `Supplement document contains extra operation \`${method}\` on path \`${path}\`.`
          );
        }

        const operation = operations[method];
        if (
          isKeyInObject(operation, 'tags') &&
          Array.isArray(operation.tags) &&
          !operation.tags.every((tag) => typeof tag === 'string' && reservedTags.has(tag))
        ) {
          throw new TypeError(
            `Cannot use \`tags\` in supplement document on path \`${path}\` and operation \`${method}\` except for tag \`${cloudOnlyTag}\` and \`${devFeatureTag}\`. Define tags in the document root instead.`
          );
        }
      }
    }
  }
};

/**
 * Check if the supplement document only contains operations (path + method) and tags that are in
 * the original document.
 *
 * @throws {TypeError} if the supplement data contains extra operations that are not in the
 * original data.
 */
export const validateSupplement = (
  original: OpenAPIV3.Document,
  supplement: DeepPartial<OpenAPIV3.Document>
) => {
  if (supplement.tags) {
    const supplementTags = z.array(z.object({ name: z.string() })).parse(supplement.tags);
    const originalTags = new Set(original.tags?.map((tag) => tag.name));

    for (const { name } of supplementTags) {
      if (!reservedTags.has(name) && !originalTags.has(name)) {
        throw new TypeError(
          `Supplement document contains extra tag \`${name}\`. If you want to add a new tag, please add it to the \`additionalTags\` array in the main swagger route file.`
        );
      }
    }
  }

  if (supplement.paths) {
    validateSupplementPaths(
      new Map(Object.entries(original.paths)),
      new Map(Object.entries(supplement.paths))
    );
  }
};

/**
 * Check if the given OpenAPI document is valid for being served as the swagger document:
 *
 * - Every path + method combination must have a tag, summary, and description.
 * - Every tag must have a description.
 *
 * @throws {TypeError} if the document is invalid.
 */
export const validateSwaggerDocument = (document: OpenAPIV3.Document) => {
  const operationIdSet = new Set<string>();

  for (const [path, operations] of Object.entries(document.paths)) {
    if (path.startsWith('/api/interaction')) {
      devConsole.warn(`Path \`${path}\` is not documented. Do something!`);
      continue;
    }

    // This path is for admin tenant only, skip it.
    if (path === '/api/.well-known/endpoints/{tenantId}') {
      continue;
    }

    if (!operations) {
      continue;
    }

    for (const method of Object.values(OpenAPIV3.HttpMethods)) {
      const operation = operations[method];

      if (!operation) {
        continue;
      }

      if (Array.isArray(operation)) {
        throw new TypeError(
          `Path \`${path}\` and operation \`${method}\` must be an object, not an array.`
        );
      }

      assert(
        operation.tags?.length,
        `Path \`${path}\` and operation \`${method}\` must have at least one tag.`
      );
      assert(
        operation.summary,
        `Path \`${path}\` and operation \`${method}\` must have a summary.`
      );
      assert(
        operation.description,
        `Path \`${path}\` and operation \`${method}\` must have a description.`
      );
      assert(
        operation.operationId,
        `Path \`${path}\` and operation \`${method}\` must have an operationId.`
      );
      assert(
        !operationIdSet.has(operation.operationId),
        `Operation ID \`${operation.operationId}\` is duplicated.`
      );
      operationIdSet.add(operation.operationId);
    }

    for (const tag of document.tags ?? []) {
      assert(
        reservedTags.has(tag.name) || tag.description,
        `Tag \`${tag.name}\` must have a description.`
      );
    }
  }
};

/**
 * **CAUTION**: This function mutates the input document.
 *
 * Remove operations (path + method) that are tagged with `Cloud only` if the application is not
 * running in the cloud and remove operations with `Dev feature` tag if Logto's `isDevFeatureEnabled` flag
 * is set to be false.
 *
 * This will prevent the swagger validation from failing in the OSS environment.
 *
 */
// eslint-disable-next-line complexity
export const removeUnnecessaryOperations = (
  document: DeepPartial<OpenAPIV3.Document>
): DeepPartial<OpenAPIV3.Document> => {
  const { isCloud, isDevFeaturesEnabled } = EnvSet.values;
  if ((isCloud && isDevFeaturesEnabled) || !document.paths) {
    return document;
  }

  for (const [path, pathItem] of Object.entries(document.paths)) {
    for (const method of Object.values(OpenAPIV3.HttpMethods)) {
      if (
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (!isCloud && pathItem?.[method]?.tags?.includes(cloudOnlyTag)) ||
        (!isDevFeaturesEnabled && pathItem?.[method]?.tags?.includes(devFeatureTag))
      ) {
        // eslint-disable-next-line @silverhand/fp/no-delete, @typescript-eslint/no-dynamic-delete -- intended
        delete pathItem[method];
      }
    }

    if (Object.keys(pathItem ?? {}).length === 0) {
      // eslint-disable-next-line @silverhand/fp/no-delete, @typescript-eslint/no-dynamic-delete -- intended
      delete document.paths[path];
    }
  }

  return document;
};

export const shouldThrow = () => !EnvSet.values.isProduction || EnvSet.values.isIntegrationTest;

/**
 * Remove all other properties when "$ref" is present in an object. Supplemental documents may
 * contain "$ref" properties, which all other properties should be removed to prevent conflicts.
 *
 * **CAUTION**: This function mutates the input document.
 */
export const pruneSwaggerDocument = (document: OpenAPIV3.Document) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const prune = (object: {}) => {
    if (isKeyInObject(object, '$ref')) {
      for (const key of Object.keys(object)) {
        if (key !== '$ref') {
          // @ts-expect-error -- intended
          // eslint-disable-next-line @silverhand/fp/no-delete, @typescript-eslint/no-dynamic-delete
          delete object[key];
        }
      }
    }

    for (const value of Object.values(object)) {
      if (isObject(value)) {
        prune(value);
      }
    }
  };

  prune(document);
};

/**
 * Check if the given router is a Management API router. The function will check if the router
 * contains the `koaAuth` middleware.
 */
export const isManagementApiRouter = ({ stack }: Router) =>
  stack
    .filter(({ path }) => !path.includes('.*'))
    .some(({ stack }) => stack.some((function_) => isKoaAuthMiddleware(function_)));
