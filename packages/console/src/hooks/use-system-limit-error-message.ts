import { type AdminConsoleKey } from '@logto/phrases';
import { type RequestErrorBody } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { type SystemLimit } from '@/cloud/types/router';

type SystemLimitKey = keyof SystemLimit;

const systemLimitKeyGuard = z.enum([
  'applicationsLimit',
  'thirdPartyApplicationsLimit',
  'scopesPerResourceLimit',
  'socialConnectorsLimit',
  'userRolesLimit',
  'machineToMachineRolesLimit',
  'scopesPerRoleLimit',
  'hooksLimit',
  'machineToMachineLimit',
  'resourcesLimit',
  'enterpriseSsoLimit',
  'tenantMembersLimit',
  'organizationsLimit',
  'samlApplicationsLimit',
  'usersPerOrganizationLimit',
  'organizationUserRolesLimit',
  'organizationMachineToMachineRolesLimit',
  'organizationScopesLimit',
]) satisfies z.ZodEnum<[SystemLimitKey, ...SystemLimitKey[]]>;

const errorBodyGuard = z.object({
  key: systemLimitKeyGuard,
});

const systemLimitEntityPhrases: Record<SystemLimitKey, AdminConsoleKey> = {
  applicationsLimit: 'system_limit.entities.application',
  thirdPartyApplicationsLimit: 'system_limit.entities.third_party_application',
  scopesPerResourceLimit: 'system_limit.entities.scope_per_resource',
  socialConnectorsLimit: 'system_limit.entities.social_connector',
  userRolesLimit: 'system_limit.entities.user_role',
  machineToMachineRolesLimit: 'system_limit.entities.machine_to_machine_role',
  scopesPerRoleLimit: 'system_limit.entities.scope_per_role',
  hooksLimit: 'system_limit.entities.hook',
  machineToMachineLimit: 'system_limit.entities.machine_to_machine',
  resourcesLimit: 'system_limit.entities.resource',
  enterpriseSsoLimit: 'system_limit.entities.enterprise_sso',
  tenantMembersLimit: 'system_limit.entities.tenant_member',
  organizationsLimit: 'system_limit.entities.organization',
  samlApplicationsLimit: 'system_limit.entities.saml_application',
  usersPerOrganizationLimit: 'system_limit.entities.user_per_organization',
  organizationUserRolesLimit: 'system_limit.entities.organization_user_role',
  organizationMachineToMachineRolesLimit:
    'system_limit.entities.organization_machine_to_machine_role',
  organizationScopesLimit: 'system_limit.entities.organization_scope',
};

export const useSystemLimitErrorMessage = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const parseSystemLimitErrorMessage = useCallback(
    (errorBody: RequestErrorBody): string => {
      if (errorBody.code !== 'system_limit.limit_exceeded') {
        return t('general.unknown_error');
      }

      const result = errorBodyGuard.safeParse(errorBody.data);
      if (!result.success) {
        return t('general.unknown_error');
      }

      const { key } = result.data;

      const entity = t(systemLimitEntityPhrases[key]);
      return t('system_limit.limit_exceeded', { entity });
    },
    [t]
  );

  return {
    parseSystemLimitErrorMessage,
  };
};
