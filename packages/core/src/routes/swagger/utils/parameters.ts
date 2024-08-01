import camelcase from 'camelcase';
import deepmerge from 'deepmerge';
import { type OpenAPIV3 } from 'openapi-types';
import pluralize from 'pluralize';
import { z } from 'zod';

import {
  fallbackDefaultPageSize,
  pageNumberKey,
  pageSizeKey,
} from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { zodTypeToSwagger } from '#src/utils/zod.js';

import { getRootComponent } from './general.js';

export type ParameterArray = Array<OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject>;

export const paginationParameters: OpenAPIV3.ParameterObject[] = [
  {
    name: pageNumberKey,
    in: 'query',
    description: 'Page number (starts from 1).',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },
  },
  {
    name: pageSizeKey,
    in: 'query',
    description: 'Entries per page.',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      default: fallbackDefaultPageSize,
    },
  },
];

export const searchParameters: OpenAPIV3.ParameterObject = {
  name: 'search_params',
  in: 'query',
  description: 'Search query parameters.',
  required: false,
  schema: {
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  },
  explode: true,
};

type BuildParameters = {
  /**
   * Build a parameter array for the given `ZodObject`.
   *
   * For path parameters, this function will try to match reusable ID parameters:
   *
   * - If the parameter name is `id`, and the path is `/organizations/{id}/users`, the parameter
   *   `id` will be a reference to `#/components/parameters/organizationId-root`.
   * - If the parameter name ends with `Id`, and the path is `/organizations/{id}/users/{userId}`,
   *   the parameter `userId` will be a reference to `#/components/parameters/userId`.
   *
   * @param zodParameters The `ZodObject` to build parameters from. The keys of the object are the
   * parameter names.
   * @param inWhere The parameters are in a path, for example, `/users/:id`.
   * @param path The path of the route. Only required when `inWhere` is `path`.
   * @returns The built parameter array for OpenAPI.
   * @see {@link buildPathIdParameters} for reusable ID parameters.
   */
  (zodParameters: unknown, inWhere: 'path', path: string): ParameterArray;
  /**
   * Build a parameter array for the given `ZodObject`.
   * @param zodParameters The `ZodObject` to build parameters from. The keys of the object are the
   * parameter names.
   * @param inWhere The parameters are in a query, for example, `/users?name=foo`.
   * @returns The built parameter array for OpenAPI.
   */
  (zodParameters: unknown, inWhere: 'query'): ParameterArray;
};

// Parameter serialization: https://swagger.io/docs/specification/serialization
export const buildParameters: BuildParameters = (
  zodParameters: unknown,
  inWhere: 'path' | 'query',
  path?: string
): ParameterArray => {
  if (!zodParameters) {
    return [];
  }

  assertThat(zodParameters instanceof z.ZodObject, 'swagger.not_supported_zod_type_for_params');

  const rootComponent = camelcase(getRootComponent(path) ?? '');

  // Type from Zod is any
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.entries(zodParameters.shape).map(([key, value]) => {
    if (inWhere === 'path') {
      if (key === 'id') {
        if (rootComponent) {
          return {
            $ref: `#/components/parameters/${pluralize(rootComponent, 1)}Id-root`,
          };
        }

        throw new Error(
          'Cannot find root path component for `:id` in path `' +
            (path ?? '') +
            '`. This is probably not expected.'
        );
      } else if (key.endsWith('Id')) {
        return {
          $ref: `#/components/parameters/${key}`,
        };
      }
    }

    return {
      name: key,
      in: inWhere,
      required: !(value instanceof z.ZodOptional),
      schema: zodTypeToSwagger(value),
    };
  });
};

const isObjectArray = (value: unknown): value is Array<Record<string, unknown>> =>
  Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null);

/**
 * Merge two arrays. If the two arrays are both object arrays, merge them with the following
 * rules:
 *
 * - If the source array has an item with `name` properties, and the destination array
 *   also has an item with the same `name` and `in` properties, merge the two items with
 *   `deepmerge`. It is assumed that the two items are using `name` for identifying the same
 *   parameter, and may use `in` to distinguish the same parameter in different places.
 * - Otherwise, append the item to the destination array (the default behavior of
 *   `deepmerge`).
 *
 * Otherwise, use `deepmerge` to merge the two arrays.
 *
 * @example
 * ```ts
 * mergeParameters(
 *   [{ name: 'foo', in: 'query', required: true }, { name: 'bar', in: 'query', required: true }],
 *   [{ name: 'foo', in: 'query', required: false }]
 * ); // [{ name: 'foo', in: 'query', required: false }, { name: 'bar', in: 'query', required: true }]
 *
 * mergeParameters(
 *   [{ name: 'foo', required: true }, { name: 'bar', required: true }],
 *   [{ name: 'foo', in: 'query', required: false }]
 * );
 * // [
 * //   { name: 'foo', required: true },
 * //   { name: 'bar', required: true },
 * //   { name: 'foo', in: 'query', required: false }
 * // ]
 * ```
 *
 * @param destination The destination array.
 * @param source The source array.
 * @returns The merged array.
 */
export const mergeParameters = (destination: unknown[], source: unknown[]) => {
  if (!isObjectArray(destination) || !isObjectArray(source)) {
    return deepmerge(destination, source);
  }

  const result = destination.slice();

  for (const item of source) {
    if (!('name' in item)) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      result.push(item);
      continue;
    }

    const index = result.findIndex(
      (resultItem) => resultItem.name === item.name && resultItem.in === item.in
    );

    if (index === -1) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      result.push(item);
    } else {
      // eslint-disable-next-line @silverhand/fp/no-mutation, @typescript-eslint/no-non-null-assertion
      result[index] = deepmerge(result[index]!, item);
    }
  }

  return result;
};

/**
 * Given a root path component, build a reusable parameter object for the entity ID in path with
 * two properties, one for the root path component, and one for other path components.
 *
 * @example
 * ```ts
 * buildPathIdParameters('organization');
 * ```
 *
 * Will generate the following object:
 *
 * ```ts
 * {
 *   organizationId: {
 *     name: 'organizationId',
 *     in: 'path',
 *     description: 'The unique identifier of the organization.',
 *     required: true,
 *     schema: {
 *       type: 'string',
 *     },
 *   },
 *   'organizationId-root': {
 *     name: 'id',
 *     // ... same as above
 *   },
 * }
 * ```
 *
 * @remarks
 * The root path component is the first path component in the path. For example, the root path
 * component of `/organizations/{id}/users` is `organizations`. Since the name of the parameter is
 * same for all root path components, we need to add an additional key with the `-root` suffix to
 * distinguish them.
 *
 * @param rootComponent The root path component in kebab case (`foo-bar`).
 * @returns The parameter object for the entity ID in path.
 */
export const buildPathIdParameters = (
  rootComponent: string
): Record<string, OpenAPIV3.ParameterObject> => {
  const entityId = `${camelcase(rootComponent)}Id`;
  const shared = {
    in: 'path',
    description: `The unique identifier of the ${rootComponent
      .split('-')
      .join(' ')
      .toLowerCase()}.`,
    required: true,
    schema: {
      type: 'string',
    },
  } as const;

  // Need to duplicate the object because OpenAPI does not support partial reference.
  // See https://github.com/OAI/OpenAPI-Specification/issues/2026
  return {
    [`${entityId}-root`]: {
      ...shared,
      name: 'id',
    },
    [entityId]: {
      ...shared,
      name: entityId,
    },
  };
};

/**
 * Build a parameter object with additional parameters that are not inferred from the path.
 */
export const customParameters = (): Record<string, OpenAPIV3.ParameterObject> => {
  const entityId = 'tenantId';
  const shared = Object.freeze({
    in: 'path',
    description: 'The unique identifier of the tenant.',
    required: true,
    schema: { type: 'string' },
  } as const);

  return Object.freeze({
    [`${entityId}-root`]: { name: 'id', ...shared },
    [entityId]: { name: 'tenantId', ...shared },
  });
};
