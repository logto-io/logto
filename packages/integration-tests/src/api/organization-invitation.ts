import { type SendMessagePayload } from '@logto/connector-kit';
import {
  type OrganizationInvitationStatus,
  type OrganizationInvitationEntity,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';
import { ApiFactory } from './factory.js';

export type PostOrganizationInvitationData = {
  inviterId?: string;
  invitee: string;
  organizationId: string;
  expiresAt: number;
  organizationRoleIds?: string[];
  messagePayload?: SendMessagePayload | false;
};

export class OrganizationInvitationApi extends ApiFactory<
  OrganizationInvitationEntity,
  PostOrganizationInvitationData
> {
  constructor() {
    super('organization-invitations');
  }

  override async create(json: PostOrganizationInvitationData) {
    return authedAdminApi.post(this.path, { json }).json<OrganizationInvitationEntity>();
  }

  async updateStatus(id: string, status: OrganizationInvitationStatus, acceptedUserId?: string) {
    return authedAdminApi
      .put(`${this.path}/${id}/status`, {
        json: {
          status,
          acceptedUserId,
        },
      })
      .json<OrganizationInvitationEntity>();
  }

  async resendMessage(id: string, messagePayload: SendMessagePayload) {
    return authedAdminApi
      .post(`${this.path}/${id}/message`, {
        json: messagePayload,
      })
      .json();
  }
}
