import {
  type ApplicationUserConsentScopesResponse,
  ApplicationUserConsentScopeType,
} from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type ScopesTableRowDataType = {
  type: ApplicationUserConsentScopeType;
  id: string;
  name: string;
  description?: string;
};

type ScopesTableRowGroupType = {
  key: string;
  label: string;
  labelRowClassName?: string;
  data: ScopesTableRowDataType[];
};

/**
 * - parseRowGroup: parse the application user consent scopes response data to table field group data
 */
const useScopesTable = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const parseRowGroup = useCallback(
    (data?: ApplicationUserConsentScopesResponse): ScopesTableRowGroupType[] => {
      if (!data) {
        return [];
      }

      const { organizationScopes, userScopes, resourceScopes } = data;

      const userScopesGroup: ScopesTableRowGroupType = {
        key: ApplicationUserConsentScopeType.UserScopes,
        label: t('application_details.permissions.user_permissions'),
        labelRowClassName: styles.sectionTitleRow,
        data: userScopes.map((scope) => ({
          type: ApplicationUserConsentScopeType.UserScopes,
          id: scope,
          name: scope,
          // TODO: @simeng-li add user profile scopes description
        })),
      };

      const organizationScopesGroup: ScopesTableRowGroupType = {
        key: ApplicationUserConsentScopeType.OrganizationScopes,
        label: t('application_details.permissions.organization_permissions'),
        labelRowClassName: styles.sectionTitleRow,
        data: organizationScopes.map(({ id, name, description }) => ({
          type: ApplicationUserConsentScopeType.OrganizationScopes,
          id,
          name,
          description: description ?? undefined,
        })),
      };

      const resourceScopesGroups = resourceScopes.map<ScopesTableRowGroupType>(
        ({ resource, scopes }) => ({
          key: resource.indicator,
          label: resource.name,
          labelRowClassName: styles.sectionTitleRow,
          data: scopes.map(({ id, name, description }) => ({
            type: ApplicationUserConsentScopeType.ResourceScopes,
            id,
            name,
            description,
          })),
        })
      );

      return [userScopesGroup, ...resourceScopesGroups, organizationScopesGroup];
    },
    [t]
  );

  const deleteScope = useCallback(
    async (scope: ScopesTableRowDataType, applicationId: string) =>
      api.delete(`api/applications/${applicationId}/user-consent-scopes/${scope.type}/${scope.id}`),
    [api]
  );

  return {
    parseRowGroup,
    deleteScope,
  };
};

export default useScopesTable;
