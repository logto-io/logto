import { z } from 'zod';

/** The status of an organization invitation. */
export enum OrganizationInvitationStatus {
  /** The invitation is pending for the invitee's response. */
  Pending = 'Pending',
  /** The invitation is accepted by the invitee. */
  Accepted = 'Accepted',
  /** The invitation is revoked by the inviter. */
  Revoked = 'Revoked',
  /** The invitation is expired, or the invitee has already joined the organization. */
  Expired = 'Expired',
}
export const organizationInvitationStatusGuard = z.nativeEnum(OrganizationInvitationStatus);
