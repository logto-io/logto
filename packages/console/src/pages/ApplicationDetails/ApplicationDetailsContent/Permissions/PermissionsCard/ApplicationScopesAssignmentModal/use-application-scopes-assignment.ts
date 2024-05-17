import {
  ApplicationUserConsentScopeType,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';

import { ScopeLevel } from './type';
import useOrganizationScopesAssignment from './use-organization-scopes-assignment';
import useResourceScopesAssignment from './use-resource-scopes-assignment';
import useUserScopesAssignment from './use-user-scopes-assignment';

const useApplicationScopesAssignment = (applicationId: string, scopeLevel: ScopeLevel) => {
  const [activeTab, setActiveTab] = useState<ApplicationUserConsentScopeType>(
    scopeLevel === ScopeLevel.Organization
      ? ApplicationUserConsentScopeType.OrganizationScopes
      : ApplicationUserConsentScopeType.UserScopes
  );
  const [isLoading, setIsLoading] = useState(false);

  const api = useApi();

  const { data, mutate } = useSWR<ApplicationUserConsentScopesResponse, RequestError>(
    `api/applications/${applicationId}/user-consent-scopes`
  );

  const userScopesAssignment = useUserScopesAssignment(data?.userScopes);
  const organizationScopesAssignment = useOrganizationScopesAssignment(data?.organizationScopes);
  const resourceScopesAssignment = useResourceScopesAssignment(data?.resourceScopes);
  const organizationResourceScopesAssignment = useResourceScopesAssignment(
    data?.organizationResourceScopes,
    { isForOrganization: true }
  );

  const clearSelectedData = useCallback(() => {
    userScopesAssignment.setSelectedData([]);
    resourceScopesAssignment.setSelectedData([]);
    organizationScopesAssignment.setSelectedData([]);
    organizationResourceScopesAssignment.setSelectedData([]);
  }, [
    organizationResourceScopesAssignment,
    organizationScopesAssignment,
    resourceScopesAssignment,
    userScopesAssignment,
  ]);

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    const newUserScopes = userScopesAssignment.selectedData.map(({ id }) => id);
    const newOrganizationScopes = organizationScopesAssignment.selectedData.map(({ id }) => id);
    const newResourceScopes = resourceScopesAssignment.selectedData.map(({ id }) => id);
    const newOrganizationResourceScopes = organizationResourceScopesAssignment.selectedData.map(
      ({ id }) => id
    );

    await api
      .post(`api/applications/${applicationId}/user-consent-scopes`, {
        json: {
          ...conditional(newUserScopes.length > 0 && { userScopes: newUserScopes }),
          ...conditional(
            newOrganizationScopes.length > 0 && {
              organizationScopes: newOrganizationScopes,
            }
          ),
          ...conditional(newResourceScopes.length > 0 && { resourceScopes: newResourceScopes }),
          ...conditional(
            newOrganizationResourceScopes.length > 0 && {
              organizationResourceScopes: newOrganizationResourceScopes,
            }
          ),
        },
      })
      .finally(() => {
        setIsLoading(false);
      });

    void mutate();
  }, [
    api,
    applicationId,
    mutate,
    organizationResourceScopesAssignment.selectedData,
    organizationScopesAssignment.selectedData,
    resourceScopesAssignment.selectedData,
    userScopesAssignment.selectedData,
  ]);

  // Return selectedScopes and setSelectedScopes based on the active tab
  const scopesAssignment = useMemo(
    () => ({
      [ApplicationUserConsentScopeType.UserScopes]: userScopesAssignment,
      [ApplicationUserConsentScopeType.ResourceScopes]: resourceScopesAssignment,
      [ApplicationUserConsentScopeType.OrganizationScopes]: organizationScopesAssignment,
      [ApplicationUserConsentScopeType.OrganizationResourceScopes]:
        organizationResourceScopesAssignment,
    }),
    [
      userScopesAssignment,
      resourceScopesAssignment,
      organizationScopesAssignment,
      organizationResourceScopesAssignment,
    ]
  );

  return {
    isLoading,
    activeTab,
    setActiveTab,
    scopesAssignment,
    clearSelectedData,
    onSubmit,
  };
};

export default useApplicationScopesAssignment;
