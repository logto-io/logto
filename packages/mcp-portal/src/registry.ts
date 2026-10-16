import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';

import { z } from 'zod';

export const upstreamNamePattern = /^[a-z][\da-z-]{0,31}$/;

const upstreamSchema = z.object({
  name: z.string().regex(upstreamNamePattern),
  url: z.string().url(),
  ownerSub: z.string().min(1),
  createdAt: z.string(),
});

export type Upstream = z.infer<typeof upstreamSchema>;

const registrySchema = z.array(upstreamSchema);

export class DuplicateUpstreamError extends Error {}

export type NewUpstream = { name: string; url: string; ownerSub: string };

/**
 * Upstreams are stored per owner. Tool names are namespaced as `<upstream>__<tool>`, so a name only
 * needs to be unique among one owner's upstreams.
 */
export type UpstreamStore = {
  listForOwner: (ownerSub: string) => Promise<Upstream[]>;
  findForOwner: (ownerSub: string, name: string) => Promise<Upstream | undefined>;
  /** Throws `DuplicateUpstreamError` if the owner already has an upstream with this name. */
  add: (input: NewUpstream) => Promise<Upstream>;
  /** Returns false when the owner has no upstream with this name. */
  remove: (ownerSub: string, name: string) => Promise<boolean>;
};

/** JSON-file store for local development. Not safe for multiple portal instances. */
export class JsonFileUpstreamStore implements UpstreamStore {
  private upstreams: Upstream[] = [];

  constructor(private readonly filePath: string) {}

  async load(): Promise<void> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      this.upstreams = registrySchema.parse(JSON.parse(raw));
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        this.upstreams = [];
        return;
      }

      throw error;
    }
  }

  async listForOwner(ownerSub: string): Promise<Upstream[]> {
    return this.upstreams.filter((upstream) => upstream.ownerSub === ownerSub);
  }

  async findForOwner(ownerSub: string, name: string): Promise<Upstream | undefined> {
    return this.upstreams.find(
      (upstream) => upstream.ownerSub === ownerSub && upstream.name === name
    );
  }

  async add(input: NewUpstream): Promise<Upstream> {
    if (await this.findForOwner(input.ownerSub, input.name)) {
      throw new DuplicateUpstreamError(`Upstream "${input.name}" already exists`);
    }

    const upstream: Upstream = { ...input, createdAt: new Date().toISOString() };
    this.upstreams = [...this.upstreams, upstream];
    await this.save();

    return upstream;
  }

  async remove(ownerSub: string, name: string): Promise<boolean> {
    const before = this.upstreams.length;
    this.upstreams = this.upstreams.filter(
      (upstream) => !(upstream.ownerSub === ownerSub && upstream.name === name)
    );

    if (this.upstreams.length === before) {
      return false;
    }

    await this.save();

    return true;
  }

  private async save(): Promise<void> {
    await mkdir(nodePath.dirname(this.filePath), { recursive: true });

    // Write to a temp file and rename, so a crash never leaves a half-written registry.
    const temporary = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(this.upstreams, null, 2));
    await rename(temporary, this.filePath);
  }
}
