import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';

import { z } from 'zod';

export const upstreamNamePattern = /^[a-z][\da-z-]{0,31}$/;

const upstreamSchema = z.object({
  name: z.string().regex(upstreamNamePattern),
  url: z.string().url(),
  portalId: z.string().min(1),
  createdAt: z.string(),
  /** Admins can switch a whole server off without removing it. */
  enabled: z.boolean().default(true),
  /** Tools hidden from listing and rejected on call, by their upstream-local name. */
  disabledTools: z.array(z.string().min(1).max(200)).default([]),
  /**
   * Organizations that can see this server. Empty means every organization that can use the portal.
   * A non-empty list narrows the portal for this server only.
   */
  organizationIds: z.array(z.string().min(1)).default([]),
  /** Whether an admin has stored a bearer token for this server. The token itself is never returned. */
  hasCredential: z.boolean().default(false),
});

export type Upstream = z.infer<typeof upstreamSchema>;

/** What is kept on disk. The credential is the encrypted form from `credential-crypto.ts`. */
const storedUpstreamSchema = upstreamSchema.omit({ hasCredential: true }).extend({
  credential: z.string().optional(),
});

type StoredUpstream = z.infer<typeof storedUpstreamSchema>;

const registrySchema = z.array(storedUpstreamSchema);

export class DuplicateUpstreamError extends Error {}

export type NewUpstream = { name: string; url: string; portalId: string };

export type UpstreamPatch = {
  enabled?: boolean;
  disabledTools?: string[];
  organizationIds?: string[];
};

/**
 * Upstreams belong to one portal. Tool names are namespaced as `<upstream>__<tool>`, so a name only
 * needs to be unique among one portal's upstreams.
 */
export type UpstreamStore = {
  listForPortal: (portalId: string) => Promise<Upstream[]>;
  findForPortal: (portalId: string, name: string) => Promise<Upstream | undefined>;
  /** Throws `DuplicateUpstreamError` if the portal already has an upstream with this name. */
  add: (input: NewUpstream) => Promise<Upstream>;
  /** Returns false when the portal has no upstream with this name. */
  remove: (portalId: string, name: string) => Promise<boolean>;
  /** Returns undefined when the portal has no upstream with this name. */
  update: (portalId: string, name: string, patch: UpstreamPatch) => Promise<Upstream | undefined>;
  /** The encrypted credential, for the endpoint to decrypt. Never sent to the admin console. */
  findCredential: (portalId: string, name: string) => Promise<string | undefined>;
  /**
   * Stores or clears the encrypted credential. Returns false when the portal has no upstream with
   * this name.
   */
  setCredential: (portalId: string, name: string, ciphertext?: string) => Promise<boolean>;
};

const toUpstream = ({ credential, ...rest }: StoredUpstream): Upstream => ({
  ...rest,
  hasCredential: credential !== undefined,
});

/** JSON-file store for local development. Not safe for multiple portal instances. */
export class JsonFileUpstreamStore implements UpstreamStore {
  private upstreams: StoredUpstream[] = [];

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

  async listForPortal(portalId: string): Promise<Upstream[]> {
    return this.upstreams
      .filter((upstream) => upstream.portalId === portalId)
      .map((upstream) => toUpstream(upstream));
  }

  async findForPortal(portalId: string, name: string): Promise<Upstream | undefined> {
    const found = this.findStored(portalId, name);

    return found && toUpstream(found);
  }

  async add(input: NewUpstream): Promise<Upstream> {
    if (this.findStored(input.portalId, input.name)) {
      throw new DuplicateUpstreamError(`Upstream "${input.name}" already exists`);
    }

    const upstream: StoredUpstream = {
      ...input,
      createdAt: new Date().toISOString(),
      enabled: true,
      disabledTools: [],
      organizationIds: [],
    };
    this.upstreams = [...this.upstreams, upstream];
    await this.save();

    return toUpstream(upstream);
  }

  async remove(portalId: string, name: string): Promise<boolean> {
    const before = this.upstreams.length;
    this.upstreams = this.upstreams.filter(
      (upstream) => !(upstream.portalId === portalId && upstream.name === name)
    );

    if (this.upstreams.length === before) {
      return false;
    }

    await this.save();

    return true;
  }

  async update(
    portalId: string,
    name: string,
    patch: UpstreamPatch
  ): Promise<Upstream | undefined> {
    const existing = this.findStored(portalId, name);

    if (!existing) {
      return undefined;
    }

    const updated: StoredUpstream = { ...existing, ...patch };
    this.upstreams = this.upstreams.map((upstream) =>
      upstream.portalId === portalId && upstream.name === name ? updated : upstream
    );
    await this.save();

    return toUpstream(updated);
  }

  async findCredential(portalId: string, name: string): Promise<string | undefined> {
    return this.findStored(portalId, name)?.credential;
  }

  async setCredential(portalId: string, name: string, ciphertext?: string): Promise<boolean> {
    const existing = this.findStored(portalId, name);

    if (!existing) {
      return false;
    }

    const updated: StoredUpstream = { ...existing, credential: ciphertext };
    this.upstreams = this.upstreams.map((upstream) =>
      upstream.portalId === portalId && upstream.name === name ? updated : upstream
    );
    await this.save();

    return true;
  }

  private findStored(portalId: string, name: string): StoredUpstream | undefined {
    return this.upstreams.find(
      (upstream) => upstream.portalId === portalId && upstream.name === name
    );
  }

  private async save(): Promise<void> {
    await mkdir(nodePath.dirname(this.filePath), { recursive: true });

    // Write to a temp file and rename, so a crash never leaves a half-written registry.
    const temporary = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(this.upstreams, null, 2));
    await rename(temporary, this.filePath);
  }
}
