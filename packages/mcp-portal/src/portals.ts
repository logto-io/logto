import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';

import { z } from 'zod';

// RFC 1123 hostname: lowercase labels of letters, digits and hyphens, no leading or trailing hyphen.
export const hostnamePattern =
  /^(?=.{1,253}$)([\da-z]([\da-z-]{0,61}[\da-z])?)(\.[\da-z]([\da-z-]{0,61}[\da-z])?)+$/;

const portalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  hostname: z.string().regex(hostnamePattern),
  createdAt: z.string(),
  /** Members of these organizations can use the portal. Empty means nobody can. */
  organizationIds: z.array(z.string().min(1)).default([]),
});

export type Portal = z.infer<typeof portalSchema>;

export class DuplicatePortalError extends Error {}

export type NewPortal = { name: string; hostname: string };

/** A portal is a hostname (for example mcp1.example.com) that serves its own list of servers. */
export type PortalStore = {
  list: () => Promise<Portal[]>;
  findByHostname: (hostname: string) => Promise<Portal | undefined>;
  findById: (id: string) => Promise<Portal | undefined>;
  /** Throws `DuplicatePortalError` when the hostname is already taken. */
  add: (input: NewPortal) => Promise<Portal>;
  /** Returns false when no portal has this id. */
  remove: (id: string) => Promise<boolean>;
  /** Replaces the portal's organization grants. Returns undefined when no portal has this id. */
  setOrganizations: (id: string, organizationIds: string[]) => Promise<Portal | undefined>;
};

/** JSON-file store for local development. Not safe for multiple portal instances. */
export class JsonFilePortalStore implements PortalStore {
  private portals: Portal[] = [];

  constructor(private readonly filePath: string) {}

  async load(): Promise<void> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      this.portals = z.array(portalSchema).parse(JSON.parse(raw));
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        this.portals = [];
        return;
      }

      throw error;
    }
  }

  async list(): Promise<Portal[]> {
    return [...this.portals];
  }

  async findByHostname(hostname: string): Promise<Portal | undefined> {
    return this.portals.find((portal) => portal.hostname === hostname);
  }

  async findById(id: string): Promise<Portal | undefined> {
    return this.portals.find((portal) => portal.id === id);
  }

  async add({ name, hostname }: NewPortal): Promise<Portal> {
    if (await this.findByHostname(hostname)) {
      throw new DuplicatePortalError(`Portal "${hostname}" already exists`);
    }

    const portal: Portal = {
      id: randomUUID(),
      name,
      hostname,
      createdAt: new Date().toISOString(),
      organizationIds: [],
    };
    this.portals = [...this.portals, portal];
    await this.save();

    return portal;
  }

  async remove(id: string): Promise<boolean> {
    const before = this.portals.length;
    this.portals = this.portals.filter((portal) => portal.id !== id);

    if (this.portals.length === before) {
      return false;
    }

    await this.save();

    return true;
  }

  async setOrganizations(id: string, organizationIds: string[]): Promise<Portal | undefined> {
    const current = await this.findById(id);

    if (!current) {
      return undefined;
    }

    const updated: Portal = { ...current, organizationIds };
    this.portals = this.portals.map((portal) => (portal.id === id ? updated : portal));
    await this.save();

    return updated;
  }

  private async save(): Promise<void> {
    await mkdir(nodePath.dirname(this.filePath), { recursive: true });

    // Write to a temp file and rename, so a crash never leaves a half-written file.
    const temporary = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(this.portals, null, 2));
    await rename(temporary, this.filePath);
  }
}
