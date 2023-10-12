import { authedAdminApi } from './api.js';

export class ApiFactory<
  Schema extends Record<string, unknown>,
  PostData extends Record<string, unknown>,
  PatchData extends Record<string, unknown> = Partial<PostData>,
> {
  constructor(public readonly path: string) {}

  async create(data: PostData): Promise<Schema> {
    return authedAdminApi.post(this.path, { json: data }).json<Schema>();
  }

  async getList(params?: URLSearchParams): Promise<Schema[]> {
    return authedAdminApi.get(this.path + '?' + (params?.toString() ?? '')).json<Schema[]>();
  }

  async get(id: string): Promise<Schema> {
    return authedAdminApi.get(this.path + '/' + id).json<Schema>();
  }

  async update(id: string, data: PatchData): Promise<Schema> {
    return authedAdminApi.patch(this.path + '/' + id, { json: data }).json<Schema>();
  }

  async delete(id: string): Promise<void> {
    await authedAdminApi.delete(this.path + '/' + id);
  }
}
