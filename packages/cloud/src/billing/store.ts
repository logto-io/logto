import { type Invoice } from './invoice.js';
import { type InvitationRecord } from './invitation.js';
import { type Sku, type SkuType } from './sku.js';
import { type Subscription } from './subscription.js';

/** A tenant member's role. Admins can manage the tenant's members and invitations. */
export type TenantRole = 'admin' | 'member';

export type MemberIdentity = {
  issuer: string;
  sub: string;
};

/**
 * Read and write access to billing, membership, and invitation data. The Postgres implementation
 * reads and writes the `meshx_cloud` database; the in-memory one exists for tests only.
 */
export type BillingStore = {
  /** The subscription of a tenant, or `null` when the tenant has none on record. */
  findSubscription: (tenantId: string) => Promise<Subscription | null>;
  /** The SKUs in the catalogue, optionally filtered by type. */
  listSkus: (filter: { type?: SkuType }) => Promise<Sku[]>;
  /** The invoices of a tenant, newest first. */
  listInvoices: (tenantId: string) => Promise<Invoice[]>;
  /** The caller's role in a tenant, or `null` when they are not a member of it. */
  findMembership: (tenantId: string, identity: MemberIdentity) => Promise<TenantRole | null>;
  /** The invitations of a tenant, newest first. */
  listInvitations: (tenantId: string) => Promise<InvitationRecord[]>;
  /** One invitation by id, or `null` when there is none. */
  findInvitation: (id: string) => Promise<InvitationRecord | null>;
  /** Stores a new invitation. */
  createInvitation: (record: InvitationRecord) => Promise<void>;
  /** Moves an invitation to a new status. */
  setInvitationStatus: (id: string, status: InvitationRecord['status']) => Promise<void>;
};

export const createInMemoryBillingStore = (
  data: {
    subscriptions?: Record<string, Subscription>;
    skus?: Sku[];
    invoices?: Record<string, Invoice[]>;
    members?: Record<string, Array<MemberIdentity & { role: TenantRole }>>;
    invitations?: InvitationRecord[];
  } = {}
): BillingStore => {
  const invitations = [...(data.invitations ?? [])];

  return {
    findSubscription: async (tenantId) => data.subscriptions?.[tenantId] ?? null,
    listSkus: async ({ type }) =>
      (data.skus ?? []).filter((sku) => (type ? sku.type === type : true)),
    listInvoices: async (tenantId) => data.invoices?.[tenantId] ?? [],
    findMembership: async (tenantId, identity) =>
      data.members?.[tenantId]?.find(
        (member) => member.issuer === identity.issuer && member.sub === identity.sub
      )?.role ?? null,
    listInvitations: async (tenantId) =>
      invitations
        .filter((invitation) => invitation.tenantId === tenantId)
        .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    findInvitation: async (id) => invitations.find((invitation) => invitation.id === id) ?? null,
    createInvitation: async (record) => {
      invitations.push(record);
    },
    setInvitationStatus: async (id, status) => {
      const invitation = invitations.find((item) => item.id === id);

      if (invitation) {
        invitation.status = status;
      }
    },
  };
};
