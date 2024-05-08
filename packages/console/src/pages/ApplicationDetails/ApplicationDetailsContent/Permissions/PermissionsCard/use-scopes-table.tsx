/* eslint-disable consistent-default-export-name/default-export-match-filename */
// We need to return a ReactNode property in the parseRowGroup function
import {
  type ApplicationUserConsentScopesResponse,
  ApplicationUserConsentScopeType,
} from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg';
import { isDevFeaturesEnabled } from '@/consts/env';
import IconButton from '@/ds-components/IconButton';
import { ToggleTip } from '@/ds-components/Tip';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

export type UserScopeTableRowDataType = {
  type: ApplicationUserConsentScopeType.UserScopes;
  id: string;
  name: string;
  description?: string;
};

type OrganizationScopeTableRowDataType = {
  type: ApplicationUserConsentScopeType.OrganizationScopes;
} & ApplicationUserConsentScopesResponse['organizationScopes'][number];

type ResourceScopeTableRowDataType = {
  type:
    | ApplicationUserConsentScopeType.ResourceScopes
    | ApplicationUserConsentScopeType.OrganizationResourceScopes;
  // Resource ID is required for resource scope patch request
  resourceId: string;
  resourceName: string;
} & ApplicationUserConsentScopesResponse['resourceScopes'][number]['scopes'][number];

export type ScopesTableRowDataType =
  | UserScopeTableRowDataType
  | OrganizationScopeTableRowDataType
  | ResourceScopeTableRowDataType;

type ScopesTableRowGroupType = {
  key: string;
  label: string | ReactNode;
  labelRowClassName?: string;
  data: ScopesTableRowDataType[];
};

/**
 * - parseRowGroup: parse the application user consent scopes response data to table field group data
 */
const useScopesTable = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { t: experienceT } = useTranslation('experience', { keyPrefix: 'user_scopes' });

  const api = useApi();

  const parseRowGroup = useCallback(
    (
      data?: ApplicationUserConsentScopesResponse
    ): {
      userLevelRowGroups: ScopesTableRowGroupType[];
      organizationLevelGroups: ScopesTableRowGroupType[];
    } => {
      if (!data) {
        return {
          userLevelRowGroups: [],
          organizationLevelGroups: [],
        };
      }

      const { userScopes, resourceScopes, organizationScopes, organizationResourceScopes } = data;

      const userScopesGroup: ScopesTableRowGroupType = {
        key: ApplicationUserConsentScopeType.UserScopes,
        label: (
          <div className={styles.label}>
            {t('application_details.permissions.user_permissions')}
            <ToggleTip
              content={t('application_details.permissions.user_data_permission_description_tips')}
            >
              <IconButton size="small">
                <Tip />
              </IconButton>
            </ToggleTip>
          </div>
        ),
        labelRowClassName: styles.sectionTitleRow,
        data: userScopes.map((scope) => ({
          type: ApplicationUserConsentScopeType.UserScopes,
          id: scope,
          name: scope,
          // We have ':' in the user scope, need to change the nsSeparator to '|' to avoid i18n ns matching
          description: experienceT(`descriptions.${scope}`, { nsSeparator: '|' }),
        })),
      };

      const resourceScopesGroups = resourceScopes.map<ScopesTableRowGroupType>(
        ({ resource, scopes }) => ({
          key: resource.indicator,
          label: resource.name,
          labelRowClassName: styles.sectionTitleRow,
          data: scopes.map((scope) => ({
            type: ApplicationUserConsentScopeType.ResourceScopes,
            ...scope,
            resourceId: resource.id,
            resourceName: resource.name,
          })),
        })
      );

      const organizationScopesGroup: ScopesTableRowGroupType = {
        key: ApplicationUserConsentScopeType.OrganizationScopes,
        label: t('application_details.permissions.organization_permissions'),
        labelRowClassName: styles.sectionTitleRow,
        data: organizationScopes.map((scope) => ({
          type: ApplicationUserConsentScopeType.OrganizationScopes,
          ...scope,
        })),
      };

      const organizationResourceScopesGroup =
        organizationResourceScopes.map<ScopesTableRowGroupType>(({ resource, scopes }) => ({
          key: resource.indicator,
          label: resource.name,
          labelRowClassName: styles.sectionTitleRow,
          data: scopes.map((scope) => ({
            type: ApplicationUserConsentScopeType.OrganizationResourceScopes,
            ...scope,
            resourceId: resource.id,
            resourceName: resource.name,
          })),
        }));

      return {
        userLevelRowGroups: [
          // Hide the user scopes group if there is no user scopes
          ...(userScopesGroup.data.length > 0 ? [userScopesGroup] : []),
          ...resourceScopesGroups,
        ],
        organizationLevelGroups: [
          // Hide the organization scopes group if there is no organization scopes
          ...(organizationScopesGroup.data.length > 0 ? [organizationScopesGroup] : []),
          ...condArray(
            /**
             * Hide the organization resource scopes group if the organization resource scopes feature is not ready
             */
            isDevFeaturesEnabled &&
              organizationResourceScopesGroup.length > 0 &&
              organizationResourceScopesGroup
          ),
        ],
      };
    },
    [experienceT, t]
  );

  const deleteScope = useCallback(
    async (scope: ScopesTableRowDataType, applicationId: string) =>
      api.delete(`api/applications/${applicationId}/user-consent-scopes/${scope.type}/${scope.id}`),
    [api]
  );

  // Only description is editable
  const editScope = useCallback(
    async (scope: ScopesTableRowDataType) => {
      const { type, id, description } = scope;

      if (type === ApplicationUserConsentScopeType.ResourceScopes) {
        const { resourceId } = scope;

        await api.patch(`api/resources/${resourceId}/scopes/${id}`, {
          json: {
            description,
          },
        });

        return;
      }

      if (type === ApplicationUserConsentScopeType.OrganizationScopes) {
        await api.patch(`api/organization-scopes/${id}`, {
          json: {
            description,
          },
        });
      }
    },
    [api]
  );

  return {
    parseRowGroup,
    deleteScope,
    editScope,
  };
};

export default useScopesTable;
/* eslint-enable consistent-default-export-name/default-export-match-filename */
