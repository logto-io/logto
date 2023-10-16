import { type SchemaLike, type GeneratedSchema, type Guard } from '@logto/schemas';
import { generateStandardId, type OmitAutoSetFields } from '@logto/shared';
import { type DeepPartial } from '@silverhand/essentials';
import camelcase from 'camelcase';
import deepmerge from 'deepmerge';
import Router, { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination, { type Pagination } from '#src/middleware/koa-pagination.js';

import type RelationQueries from './RelationQueries.js';
import type SchemaQueries from './SchemaQueries.js';

/**
 * Generate the pathname for from a table name.
 *
 * @example
 * ```ts
 * tableToPathname('organization_role') // => 'organization-role'
 * ```
 */
const tableToPathname = (tableName: string) => tableName.replaceAll('_', '-');

/**
 * Generate the camel case schema ID column name.
 *
 * @example
 * ```ts
 * camelCaseSchemaId({ tableSingular: 'organization' as const }) // => 'organizationId'
 * ```
 *
 */
const camelCaseSchemaId = <T extends { tableSingular: Table }, Table extends string>(schema: T) =>
  `${camelcase(schema.tableSingular)}Id` as const;

/**
 * Actions configuration for a {@link SchemaRouter}. It contains the
 * necessary functions to handle the CRUD operations for a schema.
 */
export class SchemaActions<
  Key extends string,
  CreateSchema extends Partial<SchemaLike<Key> & { id: string }>,
  Schema extends SchemaLike<Key> & { id: string },
> {
  constructor(public readonly queries: SchemaQueries<Key, CreateSchema, Schema>) {}

  /**
   * The function for `GET /` route to get a list of entities.
   *
   * @param pagination The request pagination info parsed from `koa-pagination`. The
   * function should honor the pagination info and return the correct entities.
   * @returns A tuple of `[count, entities]`. `count` is the total count of entities
   *  in the database; `entities` is the list of entities to be returned.
   */
  public async get({
    limit,
    offset,
  }: Pick<Pagination, 'limit' | 'offset'>): Promise<[count: number, entities: readonly Schema[]]> {
    return Promise.all([this.queries.findTotalNumber(), this.queries.findAll(limit, offset)]);
  }

  /**
   * The function for `GET /:id` route to get an entity by ID.
   *
   * @param id The ID of the entity to be fetched.
   * @returns The entity to be returned.
   * @throws An `RequestError` with 404 status code if the entity is not found.
   */
  public async getById(id: string): Promise<Readonly<Schema>> {
    return this.queries.findById(id);
  }

  /**
   * The function for `POST /` route to create an entity.
   *
   * @param data The data of the entity to be created.
   * @returns The created entity.
   */
  public async post(data: Omit<OmitAutoSetFields<CreateSchema>, 'id'>): Promise<Readonly<Schema>>;
  public async post(data: OmitAutoSetFields<CreateSchema>): Promise<Readonly<Schema>> {
    return this.queries.insert({ id: generateStandardId(), ...data });
  }

  /**
   * The function for `PATCH /:id` route to update the entity by ID.
   *
   * @param id The ID of the entity to be updated.
   * @param data The data of the entity to be updated.
   * @returns The updated entity.
   * @throws An `RequestError` with 404 status code if the entity is not found.
   */
  public async patchById(id: string, data: Partial<Schema>): Promise<Readonly<Schema>> {
    return this.queries.updateById(id, data);
  }

  /**
   * The function for `DELETE /:id` route to delete an entity by ID.
   *
   * @param id The ID of the entity to be deleted.
   * @throws An `RequestError` with 404 status code if the entity is not found.
   */
  public async deleteById(id: string): Promise<void> {
    return this.queries.deleteById(id);
  }
}

type SchemaRouterConfig = {
  /** Disable certain routes for the router. */
  disabled: {
    /** Disable `GET /` route. */
    get: boolean;
    /** Disable `POST /` route. */
    post: boolean;
    /** Disable `GET /:id` route. */
    getById: boolean;
    /** Disable `PATCH /:id` route. */
    patchById: boolean;
    /** Disable `DELETE /:id` route. */
    deleteById: boolean;
  };
};

/**
 * A standard RESTful router for a schema.
 *
 * It provides the following routes by configuring the `actions`:
 *
 * - `GET /`: Get a list of entities.
 * - `POST /`: Create an entity.
 * - `GET /:id`: Get an entity by ID.
 * - `PATCH /:id`: Update an entity by ID.
 * - `DELETE /:id`: Delete an entity by ID.
 *
 * Browse the source code for more details about request/response validation.
 *
 * @see {@link SchemaActions} for the `actions` configuration.
 */
export default class SchemaRouter<
  Key extends string,
  CreateSchema extends Partial<SchemaLike<Key> & { id: string }>,
  Schema extends SchemaLike<Key> & { id: string },
  StateT = unknown,
  CustomT extends IRouterParamContext = IRouterParamContext,
> extends Router<StateT, CustomT> {
  public readonly config: SchemaRouterConfig;

  constructor(
    public readonly schema: GeneratedSchema<Key, CreateSchema, Schema>,
    public readonly actions: SchemaActions<Key, CreateSchema, Schema>,
    config: DeepPartial<SchemaRouterConfig> = {}
  ) {
    super({ prefix: '/' + tableToPathname(schema.table) });

    this.config = deepmerge<SchemaRouterConfig, DeepPartial<SchemaRouterConfig>>(
      {
        disabled: {
          get: false,
          post: false,
          getById: false,
          patchById: false,
          deleteById: false,
        },
      },
      config
    );

    const { disabled } = this.config;

    if (!disabled.get) {
      this.get(
        '/',
        koaPagination(),
        koaGuard({ response: schema.guard.array(), status: [200] }),
        async (ctx, next) => {
          const [count, entities] = await actions.get(ctx.pagination);
          ctx.pagination.totalCount = count;
          ctx.body = entities;
          return next();
        }
      );
    }

    if (!disabled.post) {
      this.post(
        '/',
        koaGuard({
          // eslint-disable-next-line no-restricted-syntax -- `.omit()` doesn't play well for generic types
          body: schema.createGuard.omit({ id: true }) as Guard<Omit<CreateSchema, 'id'>>,
          response: schema.guard,
          status: [201],
        }),
        async (ctx, next) => {
          ctx.body = await actions.post(ctx.guard.body);
          ctx.status = 201;
          return next();
        }
      );
    }

    if (!disabled.getById) {
      this.get(
        '/:id',
        koaGuard({
          params: z.object({ id: z.string().min(1) }),
          response: schema.guard,
          status: [200, 404],
        }),
        async (ctx, next) => {
          ctx.body = await actions.getById(ctx.guard.params.id);
          return next();
        }
      );
    }

    if (!disabled.patchById) {
      this.patch(
        '/:id',
        koaGuard({
          params: z.object({ id: z.string().min(1) }),
          body: schema.updateGuard,
          response: schema.guard,
          status: [200, 404],
        }),
        async (ctx, next) => {
          ctx.body = await actions.patchById(ctx.guard.params.id, ctx.guard.body);
          return next();
        }
      );
    }

    if (!disabled.deleteById) {
      this.delete(
        '/:id',
        koaGuard({
          params: z.object({ id: z.string().min(1) }),
          status: [204, 404],
        }),
        async (ctx, next) => {
          await actions.deleteById(ctx.guard.params.id);
          ctx.status = 204;
          return next();
        }
      );
    }
  }

  /**
   * Add routes for relations between the current schema and another schema.
   *
   * The routes are:
   *
   * - `GET /:id/[pathname]`: Get the entities of the relation.
   * - `POST /:id/[pathname]`: Add entities to the relation.
   * - `DELETE /:id/[pathname]/:relationSchemaId`: Remove an entity from the relation set.
   * The `:relationSchemaId` is the entity ID in the relation schema.
   *
   * The `[pathname]` is determined by the `pathname` parameter.
   *
   * @remarks
   * The `POST /:id/[pathname]` route accepts a JSON body with the following format:
   *
   * ```json
   * { "[relationSchemaIds]": ["id1", "id2", "id3"] }
   * ```
   *
   * The `[relationSchemaIds]` is the camel case of the relation schema's table name in
   * singular form with `Ids` suffix. For example, if the relation schema's table name is
   * `organization_roles`, the `[relationSchemaIds]` will be `organizationRoleIds`.
   *
   * @param relationQueries The queries class for the relation.
   * @param pathname The pathname of the relation. If not provided, it will be
   * the camel case of the relation schema's table name.
   * @see {@link RelationQueries} for the `relationQueries` configuration.
   */
  addRelationRoutes<
    RelationCreateSchema extends Partial<SchemaLike<string> & { id: string }>,
    RelationSchema extends SchemaLike<string> & { id: string },
  >(
    relationQueries: RelationQueries<
      [typeof this.schema, GeneratedSchema<string, RelationCreateSchema, RelationSchema>]
    >,
    pathname = tableToPathname(relationQueries.schemas[1].table)
  ) {
    const relationSchema = relationQueries.schemas[1];
    const columns = {
      schemaId: camelCaseSchemaId(this.schema),
      relationSchemaId: camelCaseSchemaId(relationSchema),
      relationSchemaIds: camelCaseSchemaId(relationSchema) + 's',
    };

    // TODO: Add pagination support
    this.get(
      `/:id/${pathname}`,
      koaGuard({
        params: z.object({ id: z.string().min(1) }),
        response: relationSchema.guard.array(),
        status: [200, 404],
      }),
      async (ctx, next) => {
        const { id } = ctx.guard.params;

        // Ensure that the main entry exists
        await this.actions.getById(id);

        ctx.body = await relationQueries.getEntries(relationSchema, {
          [columns.schemaId]: id,
        });
        return next();
      }
    );

    this.post(
      `/:id/${pathname}`,
      koaGuard({
        params: z.object({ id: z.string().min(1) }),
        body: z.object({ [columns.relationSchemaIds]: z.string().min(1).array().nonempty() }),
        status: [201, 404, 422],
      }),
      async (ctx, next) => {
        const {
          params: { id },
          body: { [columns.relationSchemaIds]: relationIds },
        } = ctx.guard;

        await relationQueries.insert(
          ...(relationIds?.map<[string, string]>((relationId) => [id, relationId]) ?? [])
        );
        ctx.status = 201;
        return next();
      }
    );

    this.delete(
      `/:id/${pathname}/:relationId`,
      koaGuard({
        params: z.object({ id: z.string().min(1), relationId: z.string().min(1) }),
        status: [204, 422],
      }),
      async (ctx, next) => {
        const {
          params: { id, relationId },
        } = ctx.guard;

        await relationQueries.delete({
          [columns.schemaId]: id,
          [columns.relationSchemaId]: relationId,
        });

        ctx.status = 204;
        return next();
      }
    );
  }
}
