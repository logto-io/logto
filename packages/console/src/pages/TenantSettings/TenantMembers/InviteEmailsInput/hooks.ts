import { emailRegEx } from '@logto/core-kit';
import { conditional, conditionalArray, conditionalString } from '@silverhand/essentials';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantMemberResponse } from '@/cloud/types/router';
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

  /**
   * Find duplicated and invalid formatted email addresses.
   *
   * @param emails Array of email emails.
   * @returns
   */
  const findDuplicatedOrInvalidEmails = useCallback(
    (emails: string[] = []) => {
      const duplicatedEmails = new Set<string>();
      const invalidEmails = new Set<string>();
      const validEmails = new Set<string>(
        existingMembers.map(({ primaryEmail }) => primaryEmail ?? '').filter(Boolean)
      );

      for (const email of emails) {
        if (!emailRegEx.test(email)) {
          invalidEmails.add(email);
        }

        if (validEmails.has(email)) {
          duplicatedEmails.add(email);
        } else {
          validEmails.add(email);
        }
      }

      return {
        duplicatedEmails,
        invalidEmails,
      };
    },
    [existingMembers]
  );

  const parseEmailOptions = useCallback(
    (
      inputValues: InviteeEmailItem[]
    ): {
      values: InviteeEmailItem[];
      errorMessage?: string;
    } => {
      const { duplicatedEmails, invalidEmails } = findDuplicatedOrInvalidEmails(
        inputValues.map((email) => email.value)
      );
      // Show error message and update the inputs' status for error display.
      if (duplicatedEmails.size > 0 || invalidEmails.size > 0) {
        return {
          values: inputValues.map(({ status, ...rest }) => ({
            ...rest,
            ...conditional(
              (duplicatedEmails.has(rest.value) || invalidEmails.has(rest.value)) && {
                status: 'info',
              }
            ),
          })),
          errorMessage: conditionalArray(
            conditionalString(duplicatedEmails.size > 0 && t('tenant_members.errors.user_exists')),
            conditionalString(invalidEmails.size > 0 && t('tenant_members.errors.invalid_email'))
          ).join(' '),
        };
      }

      return { values: inputValues };
    },
    [findDuplicatedOrInvalidEmails]
  );

  return {
    parseEmailOptions,
  };
};

export default useEmailInputUtils;
