import type { ResourceResponse, Scope, ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/images/search.svg';
import type { DetailedResourceResponse } from '@/components/RoleScopesTransfer/types';
import TextInput from '@/components/TextInput';
import * as transferLayout from '@/scss/transfer.module.scss';

import ResourceItem from '../ResourceItem';
import * as styles from './index.module.scss';

type Props = {
  roleId?: string;
  selectedScopes: ScopeResponse[];
  onChange: (value: ScopeResponse[]) => void;
};

const SourceScopesBox = ({ roleId, selectedScopes, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data = [] } = useSWR<ResourceResponse[]>('/api/resources?includeScopes=true');
  const { data: roleScopes = [] } = useSWR<Scope[]>(roleId && `/api/roles/${roleId}/scopes`);

  const excludeScopeIds = new Set(roleScopes.map(({ id }) => id));

  const [keyword, setKeyword] = useState('');

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const isScopeAdded = (scope: ScopeResponse) =>
    selectedScopes.findIndex(({ id }) => id === scope.id) >= 0;

  const onSelectScope = (scope: ScopeResponse) => {
    onChange(
      isScopeAdded(scope)
        ? selectedScopes.filter(({ id }) => id !== scope.id)
        : [scope, ...selectedScopes]
    );
  };

  const onSelectResource = ({ scopes: resourceScopes }: DetailedResourceResponse) => {
    const isAllSelected = resourceScopes.every((scope) => isScopeAdded(scope));
    const resourceScopesIds = new Set(resourceScopes.map(({ id }) => id));
    const selectedScopesExcludeResourceScopes = selectedScopes.filter(
      ({ id }) => !resourceScopesIds.has(id)
    );
    onChange(
      isAllSelected
        ? selectedScopesExcludeResourceScopes
        : [...resourceScopes, ...selectedScopesExcludeResourceScopes]
    );
  };

  const getResourceSelectedScopes = ({ scopes }: DetailedResourceResponse) =>
    scopes.filter((scope) => selectedScopes.findIndex(({ id }) => id === scope.id) >= 0);

  const resources = data
    .filter(({ scopes }) => scopes.some(({ id }) => !excludeScopeIds.has(id)))
    .map(({ scopes, ...resource }) => ({
      ...resource,
      scopes: scopes
        .filter(({ id }) => !excludeScopeIds.has(id))
        .map((scope) => ({
          ...scope,
          resource,
        })),
    }));

  const dataSource =
    conditional(
      keyword &&
        resources
          .filter(({ name, scopes }) => {
            return name.includes(keyword) || scopes.some(({ name }) => name.includes(keyword));
          })
          .map(({ scopes, ...resource }) => ({
            ...resource,
            scopes: scopes.filter(
              ({ name, resource }) => name.includes(keyword) || resource.name.includes(keyword)
            ),
          }))
          .filter(({ scopes }) => scopes.length > 0)
    ) ?? resources;

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
      <div className={transferLayout.boxContent}>
        {dataSource.map((resource) => (
          <ResourceItem
            key={resource.id}
            resource={resource}
            selectedScopes={getResourceSelectedScopes(resource)}
            onSelectResource={onSelectResource}
            onSelectScope={onSelectScope}
          />
        ))}
      </div>
    </div>
  );
};

export default SourceScopesBox;
