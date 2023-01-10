import type { ResourceResponse, ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/images/search.svg';

import TextInput from '../TextInput';
import ResourceItem from './components/ResourceItem';
import * as styles from './index.module.scss';
import type { DetailedResourceResponse } from './types';

type Props = {
  excludeScopeIds: string[];
  selectedPermissions: ScopeResponse[];
  onChange: (value: ScopeResponse[]) => void;
};

const SourcePermissionsBox = ({ excludeScopeIds, selectedPermissions, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data = [] } = useSWR<ResourceResponse[]>(`/api/resources?includeScopes=true`);

  const [keyword, setKeyword] = useState('');

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const isPermissionAdded = (scope: ScopeResponse) =>
    selectedPermissions.findIndex(({ id }) => id === scope.id) >= 0;

  const onSelectPermission = (scope: ScopeResponse) => {
    const permissionAdded = isPermissionAdded(scope);

    if (permissionAdded) {
      onChange(selectedPermissions.filter(({ id }) => id !== scope.id));

      return;
    }

    onChange([scope, ...selectedPermissions]);
  };

  const onSelectResource = ({ scopes }: DetailedResourceResponse) => {
    const isAllSelected = scopes.every((scope) => isPermissionAdded(scope));
    const scopesIds = new Set(scopes.map(({ id }) => id));
    const basePermissions = selectedPermissions.filter(({ id }) => !scopesIds.has(id));

    if (isAllSelected) {
      onChange(basePermissions);

      return;
    }

    onChange([...scopes, ...basePermissions]);
  };

  const getResourceSelectedPermissions = ({ scopes }: DetailedResourceResponse) =>
    scopes.filter((scope) => selectedPermissions.findIndex(({ id }) => id === scope.id) >= 0);

  const resources = data
    .filter(({ scopes }) => scopes.some(({ id }) => !excludeScopeIds.includes(id)))
    .map(({ scopes, ...resource }) => ({
      ...resource,
      scopes: scopes
        .filter(({ id }) => !excludeScopeIds.includes(id))
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
    <div className={styles.box}>
      <div className={styles.top}>
        <TextInput
          className={styles.search}
          icon={<Search className={styles.icon} />}
          placeholder={t('general.search_placeholder')}
          onChange={handleSearchInput}
        />
      </div>
      <div className={styles.content}>
        {dataSource.map((resource) => (
          <ResourceItem
            key={resource.id}
            resource={resource}
            selectedPermissions={getResourceSelectedPermissions(resource)}
            onSelectResource={onSelectResource}
            onSelectPermission={onSelectPermission}
          />
        ))}
      </div>
    </div>
  );
};

export default SourcePermissionsBox;
