import classNames from 'classnames';
import { useState, type ChangeEvent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Search from '@/assets/icons/search.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import TextInput from '@/ds-components/TextInput';
import * as transferLayout from '@/scss/transfer.module.scss';

import SourceResourceScopesGroupItem from '../SourceResourceScopesGroupItem';
import SourceScopeItem from '../SourceScopeItem';
import {
  type SelectedScopeAssignmentScopeDataType,
  type ScopeAssignmentResourceScopesGroupDataType,
  type ScopeAssignmentScopeDataType,
} from '../type';

import * as styles from './index.module.scss';

type Props = {
  selectedScopes: SelectedScopeAssignmentScopeDataType[];
  setSelectedScopes: (scopes: SelectedScopeAssignmentScopeDataType[]) => void;
  availableScopes?: ScopeAssignmentScopeDataType[];
  groupedAvailableResourceScopes?: ScopeAssignmentResourceScopesGroupDataType[];
};

function SourceScopesBox({
  selectedScopes,
  setSelectedScopes,
  availableScopes,
  groupedAvailableResourceScopes,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // Keyword search
  const [keyword, setKeyword] = useState('');
  const handleSearchInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }, []);

  const isScopeSelected = useCallback(
    (scope: ScopeAssignmentScopeDataType) =>
      selectedScopes.findIndex(({ id }) => id === scope.id) >= 0,
    [selectedScopes]
  );

  // Get the selected scopes by resource
  const getSelectedScopesByResource = useCallback(
    (resourceGroupScopes: ScopeAssignmentScopeDataType[]) =>
      selectedScopes.filter(({ id }) => resourceGroupScopes.some((scope) => scope.id === id)),
    [selectedScopes]
  );

  // Toggle the scope selection status
  const onSelectScope = useCallback(
    (scope: SelectedScopeAssignmentScopeDataType) => {
      if (isScopeSelected(scope)) {
        setSelectedScopes(selectedScopes.filter(({ id }) => id !== scope.id));
        return;
      }

      setSelectedScopes([...selectedScopes, scope]);
    },
    [isScopeSelected, selectedScopes, setSelectedScopes]
  );

  // Toggle the resource group selection status
  const onSelectResource = useCallback(
    ({ resourceName, scopes: resourceScopes }: ScopeAssignmentResourceScopesGroupDataType) => {
      const isAllSelected = resourceScopes.every((scope) => isScopeSelected(scope));

      // Filter out the scopes that are selected and belong to the resource group
      if (isAllSelected) {
        setSelectedScopes(
          selectedScopes.filter(
            ({ id: selectedScopeId }) =>
              !resourceScopes.some(({ id: resourceScopeId }) => resourceScopeId === selectedScopeId)
          )
        );
        return;
      }

      // Add the scopes that belong to the resource group
      setSelectedScopes([
        ...selectedScopes,
        ...resourceScopes.map((scope) => ({
          ...scope,
          resourceName,
        })),
      ]);
    },
    [isScopeSelected, selectedScopes, setSelectedScopes]
  );

  // Get the keyword filtered available scopes
  const filteredAvailableScopes = useMemo(() => {
    if (!availableScopes) {
      return;
    }

    const lowerCasedKeyword = keyword.toLowerCase();

    return availableScopes.filter(({ name }) =>
      lowerCasedKeyword ? name.toLowerCase().includes(lowerCasedKeyword) : true
    );
  }, [availableScopes, keyword]);

  // Get the keyword filtered available resource group
  const filteredAvailableResourceGroup = useMemo(() => {
    if (!groupedAvailableResourceScopes) {
      return;
    }

    const lowerCasedKeyword = keyword.toLowerCase();

    return (
      groupedAvailableResourceScopes
        .map((resourceGroup) => {
          // If the resource name matches the keyword, return all the original scopes
          if (resourceGroup.resourceName.toLowerCase().includes(lowerCasedKeyword)) {
            return resourceGroup;
          }

          // If the resource name doesn't match the keyword, return the filtered scopes
          return {
            ...resourceGroup,
            scopes: resourceGroup.scopes.filter(({ name }) =>
              lowerCasedKeyword ? name.toLowerCase().includes(lowerCasedKeyword) : true
            ),
          };
        })
        // Filter out the resources if the resource name doesn't match the keyword and none of the scopes matches the keyword
        .filter(
          (resourceGroup) =>
            resourceGroup.resourceName.toLowerCase().includes(lowerCasedKeyword) ||
            resourceGroup.scopes.length > 0
        )
    );
  }, [groupedAvailableResourceScopes, keyword]);

  const isEmpty = !filteredAvailableScopes?.length && !filteredAvailableResourceGroup?.length;

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <TextInput
          className={styles.search}
          icon={<Search className={styles.icon} />}
          placeholder={t('general.search_placeholder')}
          onChange={handleSearchInput}
        />
      </div>
      <div
        className={classNames(transferLayout.boxContent, isEmpty && transferLayout.emptyBoxContent)}
      >
        {isEmpty ? (
          <EmptyDataPlaceholder size="small" title={t('role_details.permission.empty')} />
        ) : (
          <>
            {filteredAvailableResourceGroup?.map((resourceGroup) => (
              <SourceResourceScopesGroupItem
                key={resourceGroup.resourceId}
                resourceGroup={resourceGroup}
                resourceSelectedScopes={getSelectedScopesByResource(resourceGroup.scopes)}
                onSelectScope={onSelectScope}
                onSelectResource={onSelectResource}
              />
            ))}
            {filteredAvailableScopes?.map((scope) => (
              <SourceScopeItem
                key={scope.id}
                scope={scope}
                isSelected={isScopeSelected(scope)}
                onSelect={onSelectScope}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default SourceScopesBox;
