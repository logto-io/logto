import { type TenantRole } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { type Option } from '@/ds-components/Select';

import { getAssignableTenantRoles, getTenantRolePhrase } from './utils';

const useTenantRoleOptions = (): Array<Option<TenantRole>> => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });

  return useMemo(
    () =>
      getAssignableTenantRoles({ isCloud, isDevFeaturesEnabled }).map((role) => ({
        value: role,
        title: t(getTenantRolePhrase(role)),
      })),
    [t]
  );
};

export default useTenantRoleOptions;
