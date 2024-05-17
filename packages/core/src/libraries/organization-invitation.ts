import { ConnectorType, type SendMessagePayload, TemplateType } from '@logto/connector-kit';
import {
  OrganizationInvitationStatus,
  type CreateOrganizationInvitation,
  type OrganizationInvitationEntity,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { removeUndefinedKeys } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import OrganizationQueries from '#src/queries/organization/index.js';
import { createUserQueries } from '#src/queries/user.js';
import type Queries from '#src/tenants/Queries.js';

import { type ConnectorLibrary } from './connector.js';

/**
 * The ending statuses of an organization invitation per RFC 0003. It means that the invitation
 * status cannot be changed anymore.
 */
const endingStatuses = Object.freeze([
  OrganizationInvitationStatus.Accepted,
  OrganizationInvitationStatus.Expired,
  OrganizationInvitationStatus.Revoked,
]);

/** Class for managing organization invitations. */
export class OrganizationInvitationLibrary {
  constructor(
    protected readonly tenantId: string,
    protected readonly queries: Queries,
    protected readonly connector: ConnectorLibrary
  ) {}

  /**
   * Creates a new organization invitation.
   *
   * Note: If the invitation email is not skipped, and the email cannot be sent, the transaction
   * will be rolled back.
   *
   * @param data Invitation data.
   * @param data.inviterId The user ID of the inviter.
   * @param data.invitee The email address of the invitee.
   * @param data.organizationId The ID of the organization to invite to.
   * @param data.expiresAt The epoch time in milliseconds when the invitation expires.
   * @param data.organizationRoleIds The IDs of the organization roles to assign to the invitee.
   * @param messagePayload The payload to send in the email. If it is `false`, the email will be
   * skipped.
   */
  async insert(
    data: Pick<
      CreateOrganizationInvitation,
      'inviterId' | 'invitee' | 'organizationId' | 'expiresAt'
    > & { organizationRoleIds?: string[] },
    messagePayload: SendMessagePayload | false
  ) {
    const { inviterId, invitee, organizationId, expiresAt, organizationRoleIds } = data;

    if (await this.queries.organizations.relations.users.isMember(organizationId, invitee)) {
      throw new RequestError({
        status: 422,
        code: 'request.invalid_input',
        details: 'The invitee is already a member of the organization.',
      });
    }

    return this.queries.pool.transaction(async (connection) => {
      const organizationQueries = new OrganizationQueries(connection);
      // Check if any pending invitation has expired, if yes, update the invitation status to "Expired" first
      // Note: Even if the status may appear to be "Expired", the actual data in DB may still be "Pending".
      // Check `findEntities` in `OrganizationQueries` for more details.
      await organizationQueries.invitations.updateExpiredEntities({ invitee, organizationId });
      // Insert the new invitation
      const invitation = await organizationQueries.invitations.insert({
        id: generateStandardId(),
        inviterId,
        invitee,
        organizationId,
        status: OrganizationInvitationStatus.Pending,
        expiresAt,
      });

      if (organizationRoleIds?.length) {
        await organizationQueries.relations.invitationsRoles.insert(
          ...organizationRoleIds.map<[string, string]>((roleId) => [invitation.id, roleId])
        );
      }

      if (messagePayload) {
        await this.sendEmail(invitee, messagePayload);
      }

      // Additional query to get the full invitation data
      return organizationQueries.invitations.findById(invitation.id);
    });
  }

  /**
   * Revokes an organization invitation. The transaction will be rolled back if the status is one
   * of the ending statuses.
   *
   * @param id The ID of the invitation.
   * @param status The new status of the invitation.
   * @returns A promise that resolves to the updated invitation.
   * @see {@link endingStatuses} for the ending statuses.
   */
  async updateStatus(
    id: string,
    status: OrganizationInvitationStatus.Revoked
  ): Promise<OrganizationInvitationEntity>;
  /**
   * Updates the status of an organization invitation to `Accepted`, and assigns the user to the
   * organization with the provided roles in the invitation.
   *
   * The transaction will be rolled back if:
   * - The status is one of the ending statuses.
   * - The `acceptedUserId` is not provided.
   * - The `acceptedUserId` is not the same as the invitee.
   *
   * @param id The ID of the invitation.
   * @param status The new status of the invitation (`Accepted`).
   * @param acceptedUserId The user ID of the user who accepted the invitation.
   * @returns A promise that resolves to the updated invitation.
   * @see {@link endingStatuses} for the ending statuses.
   */
  async updateStatus(
    id: string,
    status: OrganizationInvitationStatus.Accepted,
    acceptedUserId: string
  ): Promise<OrganizationInvitationEntity>;
  // TODO: Error i18n
  async updateStatus(
    id: string,
    status: OrganizationInvitationStatus,
    acceptedUserId?: string
  ): Promise<OrganizationInvitationEntity> {
    const entity = await this.queries.organizations.invitations.findById(id);

    if (endingStatuses.includes(entity.status)) {
      throw new RequestError({
        status: 422,
        code: 'request.invalid_input',
        details: 'The status of the invitation cannot be changed anymore.',
      });
    }

    return this.queries.pool.transaction(async (connection) => {
      const organizationQueries = new OrganizationQueries(connection);
      const userQueries = createUserQueries(connection);

      switch (status) {
        case OrganizationInvitationStatus.Accepted: {
          // Normally this shouldn't happen, so we use `TypeError` instead of `RequestError`.
          if (!acceptedUserId) {
            throw new TypeError('The `acceptedUserId` is required when accepting an invitation.');
          }

          const user = await userQueries.findUserById(acceptedUserId);

          if (user.primaryEmail?.toLowerCase() !== entity.invitee.toLowerCase()) {
            throw new RequestError({
              status: 422,
              code: 'request.invalid_input',
              details: 'The accepted user must have the same email as the invitee.',
            });
          }

          await organizationQueries.relations.users.insert([entity.organizationId, acceptedUserId]);

          if (entity.organizationRoles.length > 0) {
            await organizationQueries.relations.rolesUsers.insert(
              ...entity.organizationRoles.map<[string, string, string]>((role) => [
                entity.organizationId,
                role.id,
                acceptedUserId,
              ])
            );
          }
          break;
        }
        case OrganizationInvitationStatus.Revoked: {
          break;
        }
        default: {
          throw new TypeError(`The status "${status}" is not supported.`);
        }
      }

      const updated = {
        status,
        acceptedUserId,
        updatedAt: Date.now(),
      };
      await organizationQueries.invitations.updateById(id, updated);

      return { ...entity, ...removeUndefinedKeys(updated) };
    });
  }

  /** Send an organization invitation email. */
  async sendEmail(to: string, payload: SendMessagePayload) {
    const emailConnector = await this.connector.getMessageConnector(ConnectorType.Email);
    return emailConnector.sendMessage({
      to,
      type: TemplateType.OrganizationInvitation,
      payload,
    });
  }
}
