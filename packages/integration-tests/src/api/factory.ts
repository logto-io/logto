import { authedAdminApi } from './api.js';

/**
 * Transform the data to a new object or array without modifying the original data.
 * This is useful since `.json()` returns an object that contains something which makes
 * it impossible to use `.toStrictEqual()` directly.
 */
const transform = <T>(data: T): T => {
  if (Array.isArray(data)) {
    // eslint-disable-next-line no-restricted-syntax
    return [...data] as T;
  }

  if (typeof data === 'object') {
    return { ...data };
  }

  return data;
};

export class ApiFactory<
  Schema extends Record<string, unknown>,
  PostData extends Record<string, unknown>,
  PatchData extends Record<string, unknown> = Partial<PostData>,
> {
  constructor(public readonly path: string) {}

  async create(data: PostData): Promise<Schema> {
    return transform(await authedAdminApi.post(this.path, { json: data }).json<Schema>());
  }

  async getList(params?: URLSearchParams): Promise<Schema[]> {
    return transform(
      await authedAdminApi.get(this.path + '?' + (params?.toString() ?? '')).json<Schema[]>()
    );
  }

  async get(id: string): Promise<Schema> {
    return transform(await authedAdminApi.get(this.path + '/' + id).json<Schema>());
  }

  async update(id: string, data: PatchData): Promise<Schema> {
    return transform(
      await authedAdminApi.patch(this.path + '/' + id, { json: data }).json<Schema>()
    );
  }

  async delete(id: string): Promise<void> {
    await authedAdminApi.delete(this.path + '/' + id);
  }
}

type RelationApiFactoryConfig = {
  /** The base path of the API. */
  basePath: string;
  /**
   * The path of the relation. It will to be appended to the base path and the ID of the parent.
   *
   * @example
   * If the base path is `organizations` and the relation path is `applications`, the final paths
   * will be `organizations/:id/applications` and `organizations/:id/applications/:applicationId`.
   */
  relationPath: string;
  /**
   * The key name of the relation IDs. It will be used in the request body.
   *
   * @example
   * If the key name is `applicationIds`, the request body will be
   * `{ applicationIds: ['id1', 'id2'] }`.
   */
  relationKey: string;
};

export class RelationApiFactory<RelationSchema extends Record<string, unknown>> {
  constructor(public readonly config: RelationApiFactoryConfig) {}

  get basePath(): string {
    return this.config.basePath;
  }

  get relationPath(): string {
    return this.config.relationPath;
  }

  get relationKey(): string {
    return this.config.relationKey;
  }

  async getList(
    id: string,
    page?: number,
    pageSize?: number,
    extraParams?: ConstructorParameters<typeof URLSearchParams>[0]
  ): Promise<RelationSchema[]> {
    const searchParams = new URLSearchParams(extraParams);

    if (page) {
      searchParams.append('page', String(page));
    }

    if (pageSize) {
      searchParams.append('page_size', String(pageSize));
    }

    return transform(
      await authedAdminApi
        .get(`${this.basePath}/${id}/${this.relationPath}`, { searchParams })
        .json<RelationSchema[]>()
    );
  }

  async add(id: string, relationIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.basePath}/${id}/${this.relationPath}`, {
      json: { [this.relationKey]: relationIds },
    });
  }

  async delete(id: string, relationId: string): Promise<void> {
    await authedAdminApi.delete(`${this.basePath}/${id}/${this.relationPath}/${relationId}`);
  }

  async replace(id: string, relationIds: string[]): Promise<void> {
    await authedAdminApi.put(`${this.basePath}/${id}/${this.relationPath}`, {
      json: { [this.relationKey]: relationIds },
    });
  }
}
