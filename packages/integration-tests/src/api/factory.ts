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
