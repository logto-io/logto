import { emailRegEx } from '@logto/core-kit';
import { OrganizationInvitationStatus } from '@logto/schemas';
import { conditional, conditionalArray, conditionalString } from '@silverhand/essentials';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantInvitationResponse, type TenantMemberResponse } from '@/cloud/types/router';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { type RequestError } from '@/hooks/use-api';

import { type InviteeEmailItem } from '../types';

const useEmailInputUtils = () => {
  const cloudApi = useAuthedCloudApi();
  const { currentTenantId } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data: existingMembers = [] } = useSWR<TenantMemberResponse[], RequestError>(
    `api/tenant/${currentTenantId}/members`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/members', { params: { tenantId: currentTenantId } })
  );

  const { data: existingInvitations = [] } = useSWR<TenantInvitationResponse[], RequestError>(
    `api/tenants/${currentTenantId}/invitations`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  /**
   * Find duplicated and invalid formatted email addresses.
   *
   * @param emails Array of email emails.
   * @returns
   */
  const findDuplicatedOrInvalidEmails = useCallback(
    (emails: string[] = []) => {
      const duplicatedEmails = new Set<string>();
      const conflictMemberEmails = new Set<string>();
      const conflictInvitationEmails = new Set<string>();
      const invalidEmails = new Set<string>();
      const validEmails = new Set<string>();

      const existingMemberEmails = new Set<string>(
        existingMembers.map(({ primaryEmail }) => primaryEmail?.toLowerCase() ?? '').filter(Boolean)
      );
      const existingInvitationEmails = new Set<string>(
        existingInvitations
          .filter(({ status }) => status === OrganizationInvitationStatus.Pending)
          .map(({ invitee }) => invitee.toLowerCase())
      );

      for (const userInputEmail of emails) {
        const email = userInputEmail.toLowerCase();
        if (!emailRegEx.test(email)) {
          invalidEmails.add(email);
        }
        // Check email collisions
        if (validEmails.has(email)) {
          duplicatedEmails.add(email);
        } else if (existingInvitationEmails.has(email)) {
          conflictInvitationEmails.add(email);
        } else if (existingMemberEmails.has(email)) {
          conflictMemberEmails.add(email);
        } else {
          validEmails.add(email);
        }
      }

      return {
        duplicatedEmails,
        conflictMemberEmails,
        conflictInvitationEmails,
        invalidEmails,
      };
    },
    [existingInvitations, existingMembers]
  );

  const parseEmailOptions = useCallback(
    (
      inputValues: InviteeEmailItem[]
    ): {
      values: InviteeEmailItem[];
      errorMessage?: string;
    } => {
      const { duplicatedEmails, conflictInvitationEmails, conflictMemberEmails, invalidEmails } =
        findDuplicatedOrInvalidEmails(inputValues.map((email) => email.value));
      // Show error message and update the inputs' status for error display.
      if (
        duplicatedEmails.size > 0 ||
        conflictInvitationEmails.size > 0 ||
        conflictMemberEmails.size > 0 ||
        invalidEmails.size > 0
      ) {
        return {
          values: inputValues.map(({ status, ...rest }) => ({
            ...rest,
            ...conditional(
              (duplicatedEmails.has(rest.value) ||
                conflictInvitationEmails.has(rest.value) ||
                conflictMemberEmails.has(rest.value) ||
                invalidEmails.has(rest.value)) && {
                status: 'error',
              }
            ),
          })),
          errorMessage: conditionalArray(
            conditionalString(duplicatedEmails.size > 0 && t('tenant_members.errors.email_exists')),
            conditionalString(
              conflictInvitationEmails.size > 0 &&
                t('tenant_members.errors.pending_invitation_exists')
            ),
            conditionalString(
              conflictMemberEmails.size > 0 && t('tenant_members.errors.member_exists')
            ),
            conditionalString(invalidEmails.size > 0 && t('tenant_members.errors.invalid_email'))
          ).join('\n'),
        };
      }

      return { values: inputValues };
    },
    [findDuplicatedOrInvalidEmails, t]
  );

  return {
    parseEmailOptions,
  };
};

export default useEmailInputUtils;
