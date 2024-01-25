import { ConnectorType, TemplateType } from '@logto/connector-kit';
import { OrganizationInvitationStatus, type CreateOrganizationInvitation } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import { getTenantEndpoint } from '#src/env-set/utils.js';
import MagicLinkQueries from '#src/queries/magic-link.js';
import OrganizationQueries from '#src/queries/organization/index.js';
import type Queries from '#src/tenants/Queries.js';

import { type ConnectorLibrary } from './connector.js';

const invitationLinkPath = '/invitation';

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
   * @param skipEmail Whether to skip sending the invitation email. Defaults to `false`.
   */
  async insert(
    data: Pick<
      CreateOrganizationInvitation,
      'inviterId' | 'invitee' | 'organizationId' | 'expiresAt'
    > & { organizationRoleIds?: string[] },
    skipEmail = false
  ) {
    const { inviterId, invitee, organizationId, expiresAt, organizationRoleIds } = data;

    return this.queries.pool.transaction(async (connection) => {
      const organizationQueries = new OrganizationQueries(connection);
      const magicLinkQueries = new MagicLinkQueries(connection);

      const magicLink = await magicLinkQueries.insert({
        id: generateStandardId(),
        token: generateStandardId(32),
      });
      const invitation = await organizationQueries.invitations.insert({
        id: generateStandardId(),
        inviterId,
        invitee,
        organizationId,
        magicLinkId: magicLink.id,
        status: OrganizationInvitationStatus.Pending,
        expiresAt,
      });

      if (organizationRoleIds?.length) {
        await organizationQueries.relations.invitationsRoles.insert(
          ...organizationRoleIds.map<[string, string]>((roleId) => [invitation.id, roleId])
        );
      }

      if (!skipEmail) {
        await this.sendEmail(invitee, magicLink.token);
      }

      return invitation;
    });
  }

  protected async sendEmail(to: string, token: string) {
    const emailConnector = await this.connector.getMessageConnector(ConnectorType.Email);
    return emailConnector.sendMessage({
      to,
      type: TemplateType.OrganizationInvitation,
      payload: {
        link: appendPath(getTenantEndpoint(this.tenantId, EnvSet.values), invitationLinkPath, token)
          .href,
      },
    });
  }
}
